package server.exception;

public class BlogNotFoundException extends RuntimeException {
    public BlogNotFoundException(Long id) {
        super("Could not find blog with id " + id);
    }
    public BlogNotFoundException(String message) {
        super(message);
    }
}
