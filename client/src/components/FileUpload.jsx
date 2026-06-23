import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function FileUpload({ onFilesSelected, maxFiles, minFiles, accept, maxSize }) {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length < minFiles) {
      alert(`Please select at least ${minFiles} files`);
      return;
    }
    if (acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    onFilesSelected(acceptedFiles);
  }, [maxFiles, minFiles, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: maxFiles > 1
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-600 font-semibold">Drop files here...</p>
      ) : (
        <>
          <p className="text-gray-700 font-semibold">Drag files here or click to select</p>
          <p className="text-sm text-gray-500 mt-2">
            {maxFiles > 1
              ? `Select ${minFiles}-${maxFiles} files (Max ${maxSize}MB each)`
              : `Max file size: ${maxSize}MB`}
          </p>
        </>
      )}
    </div>
  );
}
