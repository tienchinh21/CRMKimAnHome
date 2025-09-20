import React from "react";
import { useNavigate } from "react-router-dom";
import BlogCreateModal from "@/components/blog/BlogCreateModal";

const BlogCreate: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to blog list or detail page
    navigate("/blogs");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tạo bài viết mới
            </h1>
            <p className="text-gray-600 mt-2">
              Tạo bài viết mới với trình soạn thảo phong phú và upload ảnh
            </p>
          </div>

          <div className="flex justify-center">
            <BlogCreateModal onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCreate;
