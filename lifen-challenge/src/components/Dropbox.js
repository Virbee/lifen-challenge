import React, { Component } from "react";
import Dropzone from "react-dropzone";

class Dropbox extends Component {
  constructor(props) {
    super();
    this.state = {
      files: [],
      totalNumber: 0
    };
  }

  componentDidMount() {
    this.updateTotalCount();
    this.watchNewFiles();
  }

  updateTotalCount = () => {
    fetch("https://fhirtest.uhn.ca/baseDstu3/Binary?_summary=count")
      .then(response => response.json())
      .then(data => {
        this.setState({
          totalNumber: data.total
        });
      })
      .catch(err => console.log(err));
  };

  watchNewFiles() {
    if (window.require) {
      const chokidar = window.require("chokidar");
      const watcher = chokidar.watch("public/uploads", {
        persistent: true
      });
      watcher.on("add", filePath => {
        this.addNewFSFiles(filePath);
      });
    }
  }

  changeLoadingState = (loadingState, droppedFile, url) => {
    this.setState({
      files: this.state.files.map(fileObject => {
        if (fileObject.file === droppedFile) {
          return { file: fileObject.file, loadingState, url };
        }
        return fileObject;
      })
    });
  };

  addNewFSFiles = filePath => {
    const fs = window.require("fs");
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;

    const path = window.require("path");
    const fileName = path.basename(filePath);
    const file = { path: fileName, size: fileSizeInBytes };

    const newFile = this.state.files.concat({
      file,
      loadingState: "pending"
    });
    this.setState({ files: newFile });

    const data = fs.readFileSync(filePath);
    fetch("https://fhirtest.uhn.ca/baseDstu3/Binary", {
      method: "POST",
      body: data
    })
      .then(res => {
        const url = res.headers.get("Content-Location");
        if (res.status >= 200 && res.status <= 202) {
          this.changeLoadingState("done", file, url);
          this.updateTotalCount();
        } else {
          this.changeLoadingState("error", file);
        }
      })
      .catch(err => this.changeLoadingState("error", file));
  };

  onDrop = droppedFiles => {
    const newFilesObject = droppedFiles.map(file => {
      return { file, loadingState: "pending" };
    });
    const newFiles = this.state.files.concat(newFilesObject);
    this.setState({ files: newFiles });

    droppedFiles.forEach(droppedFile => {
      const reader = new FileReader();
      reader.onabort = () => {
        this.changeLoadingState("error", droppedFile);
      };
      reader.onerror = () => {
        this.changeLoadingState("error", droppedFile);
      };
      reader.onload = () => {
        const arrayBuffer = reader.result;
        fetch("https://fhirtest.uhn.ca/baseDstu3/Binary", {
          method: "POST",
          body: arrayBuffer
        })
          .then(res => {
            const url = res.headers.get("Content-Location");
            this.changeLoadingState("done", droppedFile, url);
            this.updateTotalCount();
          })
          .catch(err => this.changeLoadingState("error", droppedFile));
      };
      reader.readAsArrayBuffer(droppedFile);
    });
  };

  render() {
    let fileMessage = null;
    if (this.state.files[0]) {
      fileMessage = <h4>My Files</h4>;
    } else fileMessage = <h4>No file selected</h4>;

    const files = this.state.files.map(fileObject => {
      let stateIcon;
      if (fileObject.loadingState === "pending") {
        stateIcon = <i className="fas fa-spinner fa-spin" />;
      } else if (fileObject.loadingState === "done") {
        stateIcon = <i className="far fa-check-circle" />;
      } else {
        stateIcon = <i className="fas fa-exclamation-triangle" />;
      }
      return (
        <li key={fileObject.file.path}>
          {stateIcon} <a href={fileObject.url}>{fileObject.file.path}</a> -{" "}
          {fileObject.file.size} bytes
        </li>
      );
    });

    return (
      <Dropzone onDrop={this.onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div className="drop-container">
            <div {...getRootProps({ className: "drop-dialog-box" })}>
              <input {...getInputProps()} />
              <h2>
                <i className="fas fa-cloud-upload-alt" />
              </h2>
              <h3>Drag 'n' drop some files here</h3>
              <h4>or click to select files</h4>
            </div>
            <aside className="files-box">
              <h4 className="file-message">
                Currently there are {this.state.totalNumber} files on the
                server.
              </h4>
              <h4>-</h4>
              {fileMessage}
              <ul>{files}</ul>
            </aside>
          </div>
        )}
      </Dropzone>
    );
  }
}

export default Dropbox;
