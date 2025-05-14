package server.controller;

import server.exception.PostNotFoundException;
import server.model.Comment;
import server.model.PostModel;
import server.repository.CommentRepository;
import server.repository.PostRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ObjectMapper objectMapper; // Use Spring-managed ObjectMapper

    private final String UPLOAD_DIR = "src/main/post/";

    @PostMapping("/post")
    public PostModel newPostModel(
            @RequestParam("name") String name,
            @RequestParam("topic") String topic,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("tag") String tag,
            @RequestParam("file") MultipartFile file) throws IOException {

        String imageName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        file.transferTo(Paths.get(UPLOAD_DIR + imageName));

        PostModel newPostModel = new PostModel();
        newPostModel.setName(name);
        newPostModel.setTopic(topic);
        newPostModel.setDescription(description);
        newPostModel.setCategory(category);
        newPostModel.setTag(tag);
        newPostModel.setImage(imageName);
        newPostModel.setCreatedAt(LocalDateTime.now());
        newPostModel.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(newPostModel);
    }

    @GetMapping("/post")
    List<PostModel> getAllProgress() {
        return postRepository.findAll();
    }

    @GetMapping("/post/{id}")
    PostModel getProgressId(@PathVariable Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    @GetMapping("/post/image/{filename}")
    public ResponseEntity<FileSystemResource> getImage(@PathVariable String filename) {
        File file = new File(UPLOAD_DIR + filename);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new FileSystemResource(file));
    }

    @PutMapping("/post/{id}")
    public PostModel updateProgress(
            @RequestPart(value = "progress details") String progressDetails,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @PathVariable Long id
    ) {
        PostModel newProgress;
        try {
            newProgress = objectMapper.readValue(progressDetails, PostModel.class);
        } catch (IOException e) {
            System.err.println("Error parsing progress details: " + e.getMessage());
            throw new RuntimeException("Invalid progress details format", e);
        }

        return postRepository.findById(id).map(existingProgress -> {
            existingProgress.setName(newProgress.getName());
            existingProgress.setTopic(newProgress.getTopic());
            existingProgress.setDescription(newProgress.getDescription());
            existingProgress.setCategory(newProgress.getCategory());
            existingProgress.setTag(newProgress.getTag());
            existingProgress.setUpdatedAt(
                    newProgress.getUpdatedAt() != null ? newProgress.getUpdatedAt() : LocalDateTime.now()
            );

            if (file != null && !file.isEmpty()) {
                try {
                    String imageName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    File uploadDir = new File(UPLOAD_DIR);
                    if (!uploadDir.exists()) {
                        uploadDir.mkdirs();
                    }
                    file.transferTo(Paths.get(UPLOAD_DIR + imageName));
                    existingProgress.setImage(imageName);
                } catch (IOException e) {
                    System.err.println("Error saving file: " + e.getMessage());
                    throw new RuntimeException("Failed to save image", e);
                }
            }

            try {
                return postRepository.save(existingProgress);
            } catch (Exception e) {
                System.err.println("Error saving to database: " + e.getMessage());
                throw new RuntimeException("Failed to update progress in database", e);
            }
        }).orElseThrow(() -> new PostNotFoundException(id));
    }

    @DeleteMapping("/post/{id}")
    String deleteProgress(@PathVariable Long id) {
        PostModel progressItem = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        String image = progressItem.getImage();
        if (image != null && !image.isEmpty()) {
            File imageFile = new File(UPLOAD_DIR + image);
            if (imageFile.exists()) {
                if (imageFile.delete()) {
                    System.out.println("Image deleted");
                } else {
                    System.out.println("Failed to delete image");
                }
            }
        }
        postRepository.deleteById(id);
        return "Data with id " + id + " and image deleted";
    }

    // Create a comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> createComment(@PathVariable Long id, @RequestBody Comment commentRequest) {
        Optional<PostModel> post = postRepository.findById(id);
        if (post.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Comment comment = new Comment(commentRequest.getText(), post.get());
        comment.setAuthor(commentRequest.getAuthor() != null ? commentRequest.getAuthor() : "Anonymous");
        comment.setDate(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.status(201).body(savedComment);
    }

    // Get all comments for a post
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long id) {
        Optional<PostModel> post = postRepository.findById(id);
        if (post.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Comment> comments = commentRepository.findByPost(post.get());
        return ResponseEntity.ok(comments);
    }

    // Update a comment
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @PathVariable Long commentId, @RequestBody Comment commentRequest) {
        Optional<PostModel> post = postRepository.findById(id);
        if (post.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Comment> comment = commentRepository.findById(commentId);
        if (comment.isEmpty() || !comment.get().getPost().getId().equals(id)) {
            return ResponseEntity.notFound().build();
        }

        comment.get().setText(commentRequest.getText() != null ? commentRequest.getText() : comment.get().getText());
        comment.get().setAuthor(commentRequest.getAuthor() != null ? commentRequest.getAuthor() : comment.get().getAuthor());
        comment.get().setDate(LocalDateTime.now());

        Comment updatedComment = commentRepository.save(comment.get());
        return ResponseEntity.ok(updatedComment);
    }

    // Delete a comment
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @PathVariable Long commentId) {
        Optional<PostModel> post = postRepository.findById(id);
        if (post.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Comment> comment = commentRepository.findById(commentId);
        if (comment.isEmpty() || !comment.get().getPost().getId().equals(id)) {
            return ResponseEntity.notFound().build();
        }

        commentRepository.delete(comment.get());
        return ResponseEntity.ok().build();
    }
}