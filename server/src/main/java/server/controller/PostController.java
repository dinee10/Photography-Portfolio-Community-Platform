package server.controller;

import server.exception.PostNotFoundException;
import server.exception.UserNotFoundException;
import server.model.PostModel;
import server.model.UserModel;
import server.repository.PostRepository;
import server.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final String UPLOAD_DIR = "src/main/post/";
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @PostMapping("/post")
    public PostModel newPostModel(
            @RequestParam("name") String name,
            @RequestParam("topic") String topic,
            @RequestParam("description") String description,
            @RequestParam("status") String status,
            @RequestParam("tag") String tag,
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam("createdAt") String createdAt) throws IOException {

        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

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
        newPostModel.setStatus(status);
        newPostModel.setTag(tag);
        newPostModel.setImage(imageName);
        try {
            LocalDate parsedDate = LocalDate.parse(createdAt, dateFormatter);
            newPostModel.setCreatedAt(parsedDate);
            newPostModel.setUpdatedAt(parsedDate);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid createdAt date format. Use YYYY-MM-DD.");
        }
        newPostModel.setUser(user);

        return postRepository.save(newPostModel);
    }

    @GetMapping("/post")
    public List<PostModel> getUserPosts(@RequestParam("userId") Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return postRepository.findByUser(user);
    }

    @GetMapping("/post/{id}")
    public PostModel getPostId(@PathVariable Long id, @RequestParam("userId") Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        PostModel post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        if (!post.getUser().getId().equals(userId)) {
            throw new PostNotFoundException("Post not owned by user");
        }
        return post;
    }

    @GetMapping("/post/update/{id}")
    public PostModel getPostForUpdate(@PathVariable Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    @GetMapping("/post/all")
    public List<PostModel> getAllPosts() {
        return postRepository.findAll();
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
    public ResponseEntity<?> updatePost(
            @RequestPart(value = "post details", required = false) String postDetails,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @PathVariable Long id,
            @RequestParam("userId") Long userId) {
        try {
            if (postDetails == null || postDetails.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Error: 'post details' part is missing or empty");
            }

            UserModel user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));

            PostModel newPost;
            try {
                newPost = objectMapper.readValue(postDetails, PostModel.class);
            } catch (IOException e) {
                System.err.println("Error parsing post details: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Error: Invalid post details format - " + e.getMessage());
            }

            PostModel updatedPost = postRepository.findById(id).map(existingPost -> {
                if (!existingPost.getUser().getId().equals(userId)) {
                    throw new PostNotFoundException("Post not owned by user");
                }
                existingPost.setName(newPost.getName() != null ? newPost.getName() : existingPost.getName());
                existingPost.setTopic(newPost.getTopic() != null ? newPost.getTopic() : existingPost.getTopic());
                existingPost.setDescription(newPost.getDescription() != null ? newPost.getDescription() : existingPost.getDescription());
                existingPost.setStatus(newPost.getStatus() != null ? newPost.getStatus() : existingPost.getStatus());
                existingPost.setTag(newPost.getTag() != null ? newPost.getTag() : existingPost.getTag());
                existingPost.setCreatedAt(newPost.getCreatedAt() != null ? newPost.getCreatedAt() : existingPost.getCreatedAt());
                if (newPost.getUpdatedAt() == null) {
                    throw new IllegalArgumentException("UpdatedAt date is required.");
                }
                existingPost.setUpdatedAt(newPost.getUpdatedAt());

                if (file != null && !file.isEmpty()) {
                    try {
                        String imageName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                        File uploadDir = new File(UPLOAD_DIR);
                        if (!uploadDir.exists()) {
                            uploadDir.mkdirs();
                        }
                        file.transferTo(Paths.get(UPLOAD_DIR + imageName));
                        String oldImage = existingPost.getImage();
                        if (oldImage != null && !oldImage.isEmpty()) {
                            File oldImageFile = new File(UPLOAD_DIR + oldImage);
                            if (oldImageFile.exists()) {
                                oldImageFile.delete();
                            }
                        }
                        existingPost.setImage(imageName);
                    } catch (IOException e) {
                        System.err.println("Error saving file: " + e.getMessage());
                        throw new RuntimeException("Failed to save image", e);
                    }
                }

                try {
                    return postRepository.save(existingPost);
                } catch (Exception e) {
                    System.err.println("Error saving to database: " + e.getMessage());
                    throw new RuntimeException("Failed to update post in database", e);
                }
            }).orElseThrow(() -> new PostNotFoundException(id));

            return ResponseEntity.ok(updatedPost);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: User not found - " + e.getMessage());
        } catch (PostNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: Post not found or not owned by user - " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: Failed to update post - " + e.getMessage());
        }
    }

    @DeleteMapping("/post/{id}")
    public ResponseEntity<String> deletePost(@PathVariable Long id, @RequestParam("userId") Long userId) {
        try {
            UserModel user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
            PostModel postItem = postRepository.findById(id)
                    .orElseThrow(() -> new PostNotFoundException(id));
            if (!postItem.getUser().getId().equals(userId)) {
                throw new PostNotFoundException("Post not owned by user");
            }

            String image = postItem.getImage();
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
            return ResponseEntity.ok("Data with id " + id + " and image deleted");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: User not found - " + e.getMessage());
        } catch (PostNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: Post not found or not owned by user - " + e.getMessage());
        }
    }
}