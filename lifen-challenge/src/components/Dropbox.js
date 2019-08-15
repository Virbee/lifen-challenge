import React, { Component } from "react";
import Dropzone from "react-dropzone";

class Dropbox extends Component {
  constructor(props) {
    super();
    this.state = {
      files: []
    };
  }

  onDrop = droppedFiles => {
    const newFilesObject = droppedFiles.map(file => {
      return { file, loadingState: "pending" };
    });
    const newFiles = this.state.files.concat(newFilesObject);
    this.setState({ files: newFiles });

    droppedFiles.forEach(droppedFile => {
      const reader = new FileReader();
      reader.onabort = () => {
        this.setState({
          files: this.state.files.map(fileObject => {
            if (fileObject.file === droppedFile) {
              return { file: fileObject.file, loadingState: "error" };
            }
            return fileObject;
          })
        });
      };
      reader.onerror = () => {
        this.setState({
          files: this.state.files.map(fileObject => {
            if (fileObject.file === droppedFile) {
              return { file: fileObject.file, loadingState: "error" };
            }
            return fileObject;
          })
        });
      };
      reader.onload = () => {
        const arrayBuffer = reader.result;
        fetch("https://fhirtest.uhn.ca/baseDstu3/Binary", {
          method: "POST",
          body: arrayBuffer
        }).then(res => {
          this.setState({
            files: this.state.files.map(fileObject => {
              if (fileObject.file === droppedFile) {
                return { file: fileObject.file, loadingState: "done" };
              }
              return fileObject;
            })
          });
        });
      };
      reader.readAsArrayBuffer(droppedFile);
    });
  };

  render() {
    //icone correspondant à l'état de chargement du fichier
    const files = this.state.files.map(fileObject => {
      let stateIcon;
      if (fileObject.loadingState === "pending") {
        stateIcon = <i className="fas fa-cog fa-spin" />;
      } else if (fileObject.loadingState === "done") {
        stateIcon = <i className="far fa-check-circle" />;
      } else {
        stateIcon = <i className="fas fa-times" />;
      }
      return (
        <li key={fileObject.file.path}>
          {fileObject.file.path} - {fileObject.file.size} bytes {stateIcon}
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
            <aside className="files-name">
              <h4>Files</h4>
              <ul>{files}</ul>
            </aside>
          </div>
        )}
      </Dropzone>
    );
  }
}

export default Dropbox;
