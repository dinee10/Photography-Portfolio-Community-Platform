package server.controller;

import server.exception.BlogNotFoundException;
import server.model.BlogModel;
import server.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/blog")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class blogcontroller {

    @Autowired
    private BlogRepository blogRepository;

    private static final String UPLOAD_DIR = "src/main/uploads/";

    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addBlog(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("author") String author,
            @RequestParam("category") String category,
            @RequestParam(value = "newImages", required = false) MultipartFile[] images) {
        Map<String, String> response = new HashMap<>();
        try {
            System.out.println("Received /blog/add request: title=" + title + ", author=" + author + ", category=" + category);

            if (title.isEmpty() || content.isEmpty() || author.isEmpty() || category.isEmpty()) {
                response.put("error", "All fields are required");
                return ResponseEntity.badRequest().body(response);
            }

            BlogModel blog = new BlogModel();
            blog.setBlogId(UUID.randomUUID().toString());
            blog.setTitle(title);
            blog.setContent(content);
            blog.setAuthor(author);
            blog.setCategory(category);

            List<String> imageNames = new ArrayList<>();
            if (images != null && images.length > 0) {
                System.out.println("Processing " + images.length + " images");
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    System.out.println("Creating upload directory: " + UPLOAD_DIR);
                    uploadDir.mkdirs();
                }
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        String imageName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                        System.out.println("Saving image: " + imageName);
                        try {
                            image.transferTo(Paths.get(UPLOAD_DIR, imageName));
                            imageNames.add(imageName);
                        } catch (IOException e) {
                            System.err.println("Failed to upload image: " + e.getMessage());
                            response.put("error", "Failed to upload image: " + e.getMessage());
                            return ResponseEntity.status(500).body(response);
                        }
                    }
                }
            }
            blog.setBlogImages(imageNames);

            System.out.println("Saving blog to database");
            blogRepository.save(blog);
            System.out.println("Blog saved successfully");
            response.put("message", "Blog added successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in /blog/add: " + e.getMessage());
            e.printStackTrace();
            response.put("error", "Server error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping
    public ResponseEntity<List<BlogModel>> getAllBlogs() {
        try {
            System.out.println("Received /blog request");
            List<BlogModel> blogs = blogRepository.findAll();
            return ResponseEntity.ok(blogs);
        } catch (Exception e) {
            System.err.println("Error in /blog: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<BlogModel> getBlog(@PathVariable Long id) {
        try {
            System.out.println("Received /blog/get/" + id + " request");
            BlogModel blog = blogRepository.findById(id)
                    .orElseThrow(() -> new BlogNotFoundException(id));
            return ResponseEntity.ok(blog);
        } catch (BlogNotFoundException e) {
            System.err.println("Blog not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            System.err.println("Error in /blog/get/" + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<FileSystemResource> getImage(@PathVariable String filename) {
        System.out.println("Received /blog/uploads/" + filename + " request");
        File file = new File(UPLOAD_DIR + filename);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new FileSystemResource(file));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<BlogModel> updateBlog(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "newImages", required = false) MultipartFile[] images,
            @RequestParam(value = "imagesToDelete", required = false) String imagesToDeleteJson) {
        try {
            System.out.println("Received /blog/update/" + id + " request");
            BlogModel existingBlog = blogRepository.findById(id)
                    .orElseThrow(() -> new BlogNotFoundException(id));

            if (title != null) existingBlog.setTitle(title);
            if (content != null) existingBlog.setContent(content);
            if (author != null) existingBlog.setAuthor(author);
            if (category != null) existingBlog.setCategory(category);

            List<String> currentImages = existingBlog.getBlogImages() != null ? new ArrayList<>(existingBlog.getBlogImages()) : new ArrayList<>();

            if (imagesToDeleteJson != null && !imagesToDeleteJson.isEmpty()) {
                try {
                    List<String> imagesToDelete = Arrays.asList(imagesToDeleteJson.replaceAll("[\\[\\]\"]", "").split(","));
                    for (String image : imagesToDelete) {
                        if (!image.isEmpty()) {
                            System.out.println("Deleting image: " + image);
                            currentImages.remove(image);
                            File imageFile = new File(UPLOAD_DIR + image);
                            if (imageFile.exists() && !imageFile.delete()) {
                                System.out.println("Failed to delete image: " + image);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error processing images to delete: " + e.getMessage());
                    throw new RuntimeException("Error processing images to delete", e);
                }
            }

            if (images != null && images.length > 0) {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        String imageName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                        System.out.println("Saving new image: " + imageName);
                        try {
                            image.transferTo(Paths.get(UPLOAD_DIR, imageName));
                            currentImages.add(imageName);
                        } catch (IOException e) {
                            System.err.println("Error uploading image: " + e.getMessage());
                            throw new RuntimeException("Error uploading image", e);
                        }
                    }
                }
            }

            existingBlog.setBlogImages(currentImages);
            System.out.println("Saving updated blog");
            BlogModel updatedBlog = blogRepository.save(existingBlog);
            return ResponseEntity.ok(updatedBlog);
        } catch (BlogNotFoundException e) {
            System.err.println("Blog not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            System.err.println("Error in /blog/update/" + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBlog(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        try {
            System.out.println("Received /blog/" + id + " delete request");
            BlogModel blog = blogRepository.findById(id)
                    .orElseThrow(() -> new BlogNotFoundException(id));

            // Delete associated image files
            List<String> blogImages = blog.getBlogImages();
            if (blogImages != null) {
                for (String image : blogImages) {
                    File imageFile = new File(UPLOAD_DIR + image);
                    if (imageFile.exists()) {
                        if (!imageFile.delete()) {
                            System.out.println("Failed to delete image: " + image);
                        } else {
                            System.out.println("Deleted image: " + image);
                        }
                    } else {
                        System.out.println("Image file not found: " + image);
                    }
                }
            }

            // Delete the blog from the database
            blogRepository.deleteById(id);
            System.out.println("Blog with id " + id + " deleted from database");

            response.put("message", "Blog with id " + id + " deleted successfully");
            return ResponseEntity.ok(response);
        } catch (BlogNotFoundException e) {
            System.err.println("Blog not found: " + e.getMessage());
            response.put("error", "Blog not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            System.err.println("Error deleting blog with id " + id + ": " + e.getMessage());
            e.printStackTrace();
            response.put("error", "Failed to delete blog: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}