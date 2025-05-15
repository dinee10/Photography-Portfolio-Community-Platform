package server.exception;

public class VideoNotFoundException extends RuntimeException {
    public VideoNotFoundException(Long id) {
        super("Could not found the user with id "+id);
    }
}
