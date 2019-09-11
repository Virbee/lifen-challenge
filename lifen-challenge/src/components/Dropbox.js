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
      const watcher = chokidar.watch("uploads", {
        persistent: true
      });
      watcher.on("add", filePath => {
        this.addNewFSFiles(filePath);
      });
    } else {
      console.warn("This isn't an Electron app. Can't watch the directory");
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

  sendFileToServer = (data, file) => {
    if (file.size > 2000000 || file.path.indexOf(".pdf") < 0) {
      const newFiles = this.state.files.concat({ file, loadingState: "error" });
      this.setState({ files: newFiles });
    } else {
      const newFile = this.state.files.concat({
        file,
        loadingState: "pending"
      });
      this.setState({ files: newFile });
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
    }
  };

  addNewFSFiles = filePath => {
    const fs = window.require("fs");
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;

    const path = window.require("path");
    const fileName = path.basename(filePath);
    const file = { path: fileName, size: fileSizeInBytes };
    const data = fs.readFileSync(filePath);
    this.sendFileToServer(data, file);
  };

  onDrop = droppedFiles => {
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
        this.sendFileToServer(arrayBuffer, droppedFile);
      };
      reader.readAsArrayBuffer(droppedFile);
    });
  };

  render() {
    const files = this.state.files
      .filter(fileObject => fileObject.loadingState !== "error")
      .map(fileObject => {
        let stateIcon;
        if (fileObject.loadingState === "pending") {
          stateIcon = <i className="fas fa-spinner fa-spin" />;
        } else {
          stateIcon = <i className="far fa-check-circle" />;
        }
        let newSize;
        if (fileObject.file.size >= 1000000) {
          newSize = Math.round(fileObject.file.size / 100000) / 10 + "Mo";
        } else if (fileObject.file.size >= 1000) {
          newSize = Math.round(fileObject.file.size / 100) / 10 + "Ko";
        } else {
          newSize = fileObject.file.size + " octets";
        }
        return (
          <li key={fileObject.file.path}>
            {stateIcon}{" "}
            <a href={fileObject.url} download="toto.pdf">
              {fileObject.file.path}
            </a>{" "}
            - {newSize}
          </li>
        );
      });

    const failedFiles = this.state.files
      .filter(fileObject => fileObject.loadingState === "error")
      .map(fileObject => {
        let stateIcon = <i className="fas fa-exclamation-triangle" />;
        let newSize;
        if (fileObject.file.size >= 1000000) {
          newSize = Math.round(fileObject.file.size / 100000) / 10 + "Mo";
        } else if (fileObject.file.size >= 1000) {
          newSize = Math.round(fileObject.file.size / 100) / 10 + "Ko";
        } else {
          newSize = fileObject.file.size + " octets";
        }
        return (
          <li key={fileObject.file.path}>
            {stateIcon} {fileObject.file.path} - {newSize}
          </li>
        );
      });

    let fileMessage = null;
    if (!files[0]) {
      fileMessage = <h4>No file selected</h4>;
    } else if (this.state.files.length === failedFiles) {
      fileMessage = null;
    } else {
      fileMessage = <h4>My Files</h4>;
    }

    let failedMessage = null;
    if (failedFiles[0]) {
      failedMessage = <h4>These files failed to upload.</h4>;
    }

    return (
      <Dropzone onDrop={this.onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div className="drop-container">
            <div
              {...getRootProps({ className: "drop-dialog-box" })}
              accept="application/pdf"
            >
              <input {...getInputProps()} accept="application/pdf" />
              <h2>
                <i className="fas fa-cloud-upload-alt" />
              </h2>
              <h3>Drag 'n' drop some files here</h3>
              <h4>or click to select files</h4>
              <p>(2Mo max, pdf only)</p>
            </div>
            <aside className="files-box">
              <h4 className="file-message">
                Currently there are {this.state.totalNumber} files on the
                server.
              </h4>
              <h4>-</h4>
              {fileMessage}
              <ul>{files}</ul>
              <br></br>
              {failedMessage}
              <ul>{failedFiles}</ul>
            </aside>
          </div>
        )}
      </Dropzone>
    );
  }
}

export default Dropbox;
