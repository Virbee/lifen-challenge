import React, { Component } from "react";
import Dropzone from "react-dropzone";

class Dropbox extends Component {
  constructor(props) {
    super();
    this.state = {
      files: []
    };
  }

  onDrop = files => {
    let newFiles = this.state.files.concat(files);
    this.setState({ files: newFiles });
  };

  render() {
    const files = this.state.files.map(file => (
      <li key={file.path}>
        {file.path} - {file.size} bytes
      </li>
    ));
    return (
      <Dropzone onDrop={this.onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div className="drop-container">
            <div {...getRootProps({ className: "drop-dialog-box" })}>
              <input {...getInputProps()} />
              <h2>
                <i class="fas fa-cloud-upload-alt" />
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
