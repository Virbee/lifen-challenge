import React from "react";
import { useDropzone } from "react-dropzone";

function Dropbox(props) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));
  return (
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
  );
}

export default Dropbox;
