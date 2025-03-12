"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface TaskUploadProps {
    fetchTasks: () => Promise<void>;
}

const TaskUpload = ({ fetchTasks }: TaskUploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null); // Clear previous errors
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "text/csv": [".csv"] },
        multiple: false,
    });

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload_task", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            await fetchTasks(); // Refresh the task list
            alert("File uploaded successfully!");
        } catch (error) {
            alert("File uploaded successfully!");
        } finally {
            setUploading(false);
            setFile(null);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 border rounded-lg shadow-lg h-[100vh] w-full max-w-md mx-auto bg-white">
            <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-100"
                } p-4 text-center`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className="text-blue-500 font-medium">Drop the file here...</p>
                ) : (
                    <p className="text-gray-600">Drag & drop a CSV file here, or click to select one</p>
                )}
                {file && <p className="mt-2 text-sm text-green-500">{file.name}</p>}
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            
            <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
            >
                {uploading ? "Uploading..." : "Upload CSV"}
            </button>
        </div>
    );
};

export default TaskUpload;
