// Blog Management Types
export interface CreateBlogDto {
  title: string;
  content: string;
  mainImage: string;
  isNews: boolean;
  isLegal: boolean;
  isOutstandingProject: boolean;
  isHide: boolean;
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  mainImage?: string;
  isNews?: boolean;
  isLegal?: boolean;
  isOutstandingProject?: boolean;
  isHide?: boolean;
}

export interface ReponseBlogDto {
  id: string;
  title: string;
  content: string;
  mainImage: string;
  isNews: boolean;
  isLegal: boolean;
  isOutstandingProject: boolean;
  isHide: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Blog Category Types
export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Blog Specification types for filtering
export interface SpecificationBlog {
  // Add filter properties as needed
  [key: string]: any;
}
