package server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import server.exception.BlogNotFoundException;
import server.exception.UserNotFoundException;
import server.model.BlogModel;
import server.model.UserModel;
import server.repository.BlogRepository;
import server.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;

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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String UPLOAD_DIR = "src/main/uploads/";

    @PostMapping("/add")
    @Transactional
    public ResponseEntity<Map<String, String>> addBlog(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("author") String author,
            @RequestParam("category") String category,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("userId") Long userId) {
        Map<String, String> response = new HashMap<>();
        try {
            System.out.println("Received /blog/add request: title=" + title + ", userId=" + userId);

            if (title.isEmpty() || content.isEmpty() || author.isEmpty() || category.isEmpty()) {
                response.put("error", "All fields are required");
                return ResponseEntity.badRequest().body(response);
            }

            UserModel user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));

            BlogModel newBlog = new BlogModel();
            newBlog.setTitle(title);
            newBlog.setContent(content);
            newBlog.setAuthor(author);
            newBlog.setCategory(category);
            newBlog.setUser(user);

            String imageName = null;
            if (file != null && !file.isEmpty()) {
                System.out.println("Processing image");
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    System.out.println("Creating upload directory: " + UPLOAD_DIR);
                    uploadDir.mkdirs();
                }
                imageName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                System.out.println("Saving image: " + imageName);
                try {
                    file.transferTo(Paths.get(UPLOAD_DIR, imageName));
                    newBlog.setImage(imageName);
                } catch (IOException e) {
                    System.err.println("Failed to upload image: " + e.getMessage());
                    response.put("error", "Failed to upload image: " + e.getMessage());
                    return ResponseEntity.status(500).body(response);
                }
            }

            System.out.println("Blog ID before save: " + newBlog.getId());
            BlogModel savedBlog = blogRepository.save(newBlog);
            System.out.println("Blog ID after save: " + savedBlog.getId());
            response.put("message", "Blog added successfully");
            response.put("blogId", savedBlog.getId().toString());
            return ResponseEntity.ok(response);
        } catch (UserNotFoundException e) {
            System.err.println("User not found: " + e.getMessage());
            response.put("error", "User not found: " + userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
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

    @GetMapping("/user")
    public ResponseEntity<List<BlogModel>> getUserBlogs(@RequestParam("userId") Long userId) {
        try {
            System.out.println("Received /blog/user?userId=" + userId + " request");
            UserModel user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
            List<BlogModel> blogs = blogRepository.findByUser(user);
            return ResponseEntity.ok(blogs);
        } catch (UserNotFoundException e) {
            System.err.println("User not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            System.err.println("Error in /blog/user: " + e.getMessage());
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
    @Transactional
    public ResponseEntity<BlogModel> updateBlog(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "userId") Long userId) {
        try {
            System.out.println("Received /blog/update/" + id + " request");
            BlogModel existingBlog = blogRepository.findById(id)
                    .orElseThrow(() -> new BlogNotFoundException(id));

            UserModel user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
            if (!existingBlog.getUser().getId().equals(userId)) {
                throw new BlogNotFoundException("Blog not owned by user");
            }

            if (title != null) existingBlog.setTitle(title);
            if (content != null) existingBlog.setContent(content);
            if (author != null) existingBlog.setAuthor(author);
            if (category != null) existingBlog.setCategory(category);

            if (file != null && !file.isEmpty()) {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
                String imageName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                System.out.println("Saving new image: " + imageName);
                try {
                    file.transferTo(Paths.get(UPLOAD_DIR, imageName));
                    String oldImage = existingBlog.getImage();
                    if (oldImage != null && !oldImage.isEmpty()) {
                        File oldImageFile = new File(UPLOAD_DIR + oldImage);
                        if (oldImageFile.exists()) {
                            oldImageFile.delete();
                        }
                    }
                    existingBlog.setImage(imageName);
                } catch (IOException e) {
                    System.err.println("Error uploading image: " + e.getMessage());
                    throw new RuntimeException("Error uploading image", e);
                }
            }

            System.out.println("Saving updated blog");
            BlogModel updatedBlog = blogRepository.save(existingBlog);
            return ResponseEntity.ok(updatedBlog);
        } catch (BlogNotFoundException e) {
            System.err.println("Blog not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (UserNotFoundException e) {
            System.err.println("User not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            System.err.println("Error in /blog/update/" + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteBlog(@PathVariable Long id, @RequestParam("userId") Long userId) {
        Map<String, String> response = new HashMap<>();
        try {
            System.out.println("Received /blog/" + id + " delete request");
            BlogModel blog = blogRepository.findById(id)
                    .orElseThrow(() -> new BlogNotFoundException(id));

            UserModel user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
            if (!blog.getUser().getId().equals(userId)) {
                throw new BlogNotFoundException("Blog not owned by user");
            }

            String image = blog.getImage();
            if (image != null && !image.isEmpty()) {
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

            blogRepository.deleteById(id);
            System.out.println("Blog with id " + id + " deleted from database");
            response.put("message", "Blog with id " + id + " deleted successfully");
            return ResponseEntity.ok(response);
        } catch (BlogNotFoundException e) {
            System.err.println("Blog not found: " + e.getMessage());
            response.put("error", "Blog not found or not owned by user: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (UserNotFoundException e) {
            System.err.println("User not found: " + e.getMessage());
            response.put("error", "User not found: " + userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            System.err.println("Error deleting blog with id " + id + ": " + e.getMessage());
            e.printStackTrace();
            response.put("error", "Failed to delete blog: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}