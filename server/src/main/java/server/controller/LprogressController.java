package server.controller;

import server.exception.LprogressNotFoundException;
import server.exception.UserNotFoundException;
import server.model.LprogressModel;
import server.model.UserModel;
import server.repository.LprogressRepository;
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
import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class LprogressController {

    @Autowired
    private LprogressRepository lprogressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final String UPLOAD_DIR = "src/main/uploads/";

    @PostMapping("/progress")
    public LprogressModel newLprogressModel(
            @RequestParam("name") String name,
            @RequestParam("topic") String topic,
            @RequestParam("description") String description,
            @RequestParam("status") String status,
            @RequestParam("tag") String tag,
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) throws IOException {

        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        String imageName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        file.transferTo(Paths.get(UPLOAD_DIR + imageName));

        LprogressModel newLprogressModel = new LprogressModel();
        newLprogressModel.setName(name);
        newLprogressModel.setTopic(topic);
        newLprogressModel.setDescription(description);
        newLprogressModel.setStatus(status);
        newLprogressModel.setTag(tag);
        newLprogressModel.setImage(imageName);
        newLprogressModel.setCreatedAt(LocalDateTime.now());
        newLprogressModel.setUpdatedAt(LocalDateTime.now());
        newLprogressModel.setUser(user);

        return lprogressRepository.save(newLprogressModel);
    }

    @GetMapping("/progress")
    public List<LprogressModel> getUserProgress(@RequestParam("userId") Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return lprogressRepository.findByUser(user);
    }

    @GetMapping("/progress/{id}")
    public LprogressModel getProgressId(@PathVariable Long id, @RequestParam("userId") Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        LprogressModel progress = lprogressRepository.findById(id)
                .orElseThrow(() -> new LprogressNotFoundException(id));
        if (!progress.getUser().getId().equals(userId)) {
            throw new LprogressNotFoundException("Progress not owned by user");
        }
        return progress;
    }

    @GetMapping("/progress/update/{id}")
    public LprogressModel getProgressId(@PathVariable Long id) {
        return lprogressRepository.findById(id)
                .orElseThrow(() -> new LprogressNotFoundException(id));
    }

    @GetMapping("/progress/all")
    public List<LprogressModel> getAllProgress() {
        return lprogressRepository.findAll();
    }

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<FileSystemResource> getImage(@PathVariable String filename) {
        File file = new File(UPLOAD_DIR + filename);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new FileSystemResource(file));
    }

    @PutMapping("/progress/{id}")
    public ResponseEntity<?> updateProgress(
            @RequestPart(value = "progress details", required = false) String progressDetails,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @PathVariable Long id,
            @RequestParam("userId") Long userId) {
        try {
            System.out.println("Received userId: " + userId);
            System.out.println("Received progress details: " + progressDetails);
            System.out.println("File present: " + (file != null ? file.getOriginalFilename() : "No file"));

            if (progressDetails == null || progressDetails.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Error: 'progress details' part is missing or empty");
            }

            UserModel user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));

            LprogressModel newProgress;
            try {
                newProgress = objectMapper.readValue(progressDetails, LprogressModel.class);
            } catch (IOException e) {
                System.err.println("Error parsing progress details: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Error: Invalid progress details format - " + e.getMessage());
            }

            LprogressModel updatedProgress = lprogressRepository.findById(id).map(existingProgress -> {
                if (!existingProgress.getUser().getId().equals(userId)) {
                    throw new LprogressNotFoundException("Progress not owned by user");
                }
                existingProgress.setName(newProgress.getName() != null ? newProgress.getName() : existingProgress.getName());
                existingProgress.setTopic(newProgress.getTopic() != null ? newProgress.getTopic() : existingProgress.getTopic());
                existingProgress.setDescription(newProgress.getDescription() != null ? newProgress.getDescription() : existingProgress.getDescription());
                existingProgress.setStatus(newProgress.getStatus() != null ? newProgress.getStatus() : existingProgress.getStatus());
                existingProgress.setTag(newProgress.getTag() != null ? newProgress.getTag() : existingProgress.getTag());
                existingProgress.setUpdatedAt(LocalDateTime.now());

                if (file != null && !file.isEmpty()) {
                    try {
                        String imageName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                        File uploadDir = new File(UPLOAD_DIR);
                        if (!uploadDir.exists()) {
                            uploadDir.mkdirs();
                        }
                        file.transferTo(Paths.get(UPLOAD_DIR + imageName));
                        String oldImage = existingProgress.getImage();
                        if (oldImage != null && !oldImage.isEmpty()) {
                            File oldImageFile = new File(UPLOAD_DIR + oldImage);
                            if (oldImageFile.exists()) {
                                oldImageFile.delete();
                            }
                        }
                        existingProgress.setImage(imageName);
                    } catch (IOException e) {
                        System.err.println("Error saving file: " + e.getMessage());
                        throw new RuntimeException("Failed to save image", e);
                    }
                }

                try {
                    return lprogressRepository.save(existingProgress);
                } catch (Exception e) {
                    System.err.println("Error saving to database: " + e.getMessage());
                    throw new RuntimeException("Failed to update progress in database", e);
                }
            }).orElseThrow(() -> new LprogressNotFoundException(id));

            return ResponseEntity.ok(updatedProgress);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: User not found - " + e.getMessage());
        } catch (LprogressNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: Progress not found or not owned by user - " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: Failed to update progress - " + e.getMessage());
        }
    }

    @DeleteMapping("/progress/{id}")
    public ResponseEntity<String> deleteProgress(@PathVariable Long id, @RequestParam("userId") Long userId) {
        try {
            UserModel user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
            LprogressModel progressItem = lprogressRepository.findById(id)
                    .orElseThrow(() -> new LprogressNotFoundException(id));
            if (!progressItem.getUser().getId().equals(userId)) {
                throw new LprogressNotFoundException("Progress not owned by user");
            }

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

            lprogressRepository.deleteById(id);
            return ResponseEntity.ok("Data with id " + id + " and image deleted");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: User not found - " + e.getMessage());
        } catch (LprogressNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: Progress not found or not owned byyss user - " + e.getMessage());
        }
    }
}