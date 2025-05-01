package server.controller;

import server.exception.LprogressNotFoundException;
import server.model.LprogressModel;
import server.repository.LprogressRepository;
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

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class LprogressController {

    @Autowired
    private LprogressRepository lprogressRepository;

    @Autowired
    private ObjectMapper objectMapper; // Use Spring-managed ObjectMapper

    private final String UPLOAD_DIR = "src/main/uploads/";

    @PostMapping("/progress")
    public LprogressModel newLprogressModel(
            @RequestParam("name") String name,
            @RequestParam("topic") String topic,
            @RequestParam("description") String description,
            @RequestParam("status") String status,
            @RequestParam("tag") String tag,
            @RequestParam("file") MultipartFile file) throws IOException {

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

        return lprogressRepository.save(newLprogressModel);
    }

    @GetMapping("/progress")
    List<LprogressModel> getAllProgress() {
        return lprogressRepository.findAll();
    }

    @GetMapping("/progress/{id}")
    LprogressModel getProgressId(@PathVariable Long id) {
        return lprogressRepository.findById(id)
                .orElseThrow(() -> new LprogressNotFoundException(id));
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
    public LprogressModel updateProgress(
            @RequestPart(value = "progress details") String progressDetails,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @PathVariable Long id
    ) {
        LprogressModel newProgress;
        try {
            newProgress = objectMapper.readValue(progressDetails, LprogressModel.class);
        } catch (IOException e) {
            System.err.println("Error parsing progress details: " + e.getMessage());
            throw new RuntimeException("Invalid progress details format", e);
        }

        return lprogressRepository.findById(id).map(existingProgress -> {
            existingProgress.setName(newProgress.getName());
            existingProgress.setTopic(newProgress.getTopic());
            existingProgress.setDescription(newProgress.getDescription());
            existingProgress.setStatus(newProgress.getStatus());
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
                return lprogressRepository.save(existingProgress);
            } catch (Exception e) {
                System.err.println("Error saving to database: " + e.getMessage());
                throw new RuntimeException("Failed to update progress in database", e);
            }
        }).orElseThrow(() -> new LprogressNotFoundException(id));
    }

    //delete
    @DeleteMapping("/progress/{id}")
    String deleteProgress(@PathVariable Long id){
        //check exist in db
        LprogressModel progressItem = lprogressRepository.findById(id)
                .orElseThrow(()-> new LprogressNotFoundException(id));
        //img delete part
        String image = progressItem.getImage();
        if(image != null && !image.isEmpty()){
            File imageFile = new File("src/main/uploads" + image);
            if(imageFile.exists()){
                if(imageFile.delete()){
                    System.out.println("Image deleted");
                }else{
                    System.out.println("failed image deleted");
                }
            }
        }
        //delete item from the repo
        lprogressRepository.deleteById(id);
        return "data with id" +id + "and image deleted";
    }
}