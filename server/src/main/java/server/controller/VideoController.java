package server.controller;

import server.exception.VideoNotFoundException;
import server.model.Video;
import server.repository.videoRepositery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1/users")
public class VideoController {

    @Autowired
    private videoRepositery videoRepositery;

    // Existing methods (unchanged)
    @PostMapping
    public Video createUser(@RequestBody Video video) {
        return videoRepositery.save(video);
    }

    @GetMapping
    public List<Video> getAllUsers() {
        return videoRepositery.findAll();
    }

    @GetMapping("/{id}")
    public Video getUserById(@PathVariable Long id) {
        return videoRepositery.findById(id)
                .orElseThrow(() -> new VideoNotFoundException(id));
    }

    @PutMapping("/{id}")
    public Video updateUser(@RequestBody Video newVideo, @PathVariable Long id) {
        return videoRepositery.findById(id)
                .map(video -> {
                    video.setName(newVideo.getName());
                    video.setAge(newVideo.getAge());
                    video.setEmail(newVideo.getEmail());
                    video.setDescription(newVideo.getDescription());
                    return videoRepositery.save(video);
                })
                .orElseThrow(() -> new VideoNotFoundException(id));
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        if (!videoRepositery.existsById(id)) {
            throw new VideoNotFoundException(id);
        }
        videoRepositery.deleteById(id);
        return "Video with ID " + id + " has been deleted successfully.";
    }

    @PutMapping("/increment/{id}")
    public Video incrementUserAge(@PathVariable Long id) {
        return videoRepositery.findById(id)
                .map(video -> {
                    video.setAge(video.getAge() + 1);
                    return videoRepositery.save(video);
                })
                .orElseThrow(() -> new VideoNotFoundException(id));
    }

    // Fixed method to upload image for a user
    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadUserImage(@PathVariable Long id,
                                             @RequestPart("imageFile") MultipartFile imageFile) {
        try {
            // Find the video by ID
            Video video = videoRepositery.findById(id)
                    .orElseThrow(() -> new VideoNotFoundException(id));

            // Set image details
            video.setImageName(imageFile.getOriginalFilename());
            video.setImageType(imageFile.getContentType());
            video.setImageData(imageFile.getBytes()); // Updated to imageData

            // Save updated video
            Video updatedVideo = videoRepositery.save(video);

            // Return success response
            return new ResponseEntity<>(updatedVideo, HttpStatus.OK);
        } catch (IOException e) {
            // Handle file processing errors
            return new ResponseEntity<>("Failed to process image file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // Handle other errors
            return new ResponseEntity<>("Failed to upload image: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}