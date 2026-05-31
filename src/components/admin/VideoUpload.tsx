import { useState, useRef } from "react";
import { Upload, X, Loader2, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const VideoUpload = ({ value, onChange }: VideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please upload a video file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 20MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem("elixlumi_admin_token");
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("image", file); // Reusing the same field name as server expects 'image' for any upload

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      onChange(result.url);
      toast({ title: "Success", description: "Video uploaded successfully." });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <video
            src={value}
            className="w-full h-48 object-cover rounded-lg border border-accent/20"
            controls
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="bg-background/80 backdrop-blur-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Replace
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
            flex flex-col items-center justify-center gap-3 transition-colors
            ${dragActive 
              ? "border-primary bg-primary/10" 
              : "border-accent/30 hover:border-accent/50 bg-muted/10"
            }
            ${isUploading ? "pointer-events-none" : ""}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading video...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
                <VideoIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground">
                  <span className="text-primary font-medium">Click to upload video</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">MP4, WEBM up to 20MB</p>
              </div>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default VideoUpload;
