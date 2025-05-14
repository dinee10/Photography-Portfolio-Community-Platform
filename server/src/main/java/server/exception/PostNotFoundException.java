package server.exception;

public class PostNotFoundException extends RuntimeException{
    public PostNotFoundException(Long id) {
        super("could not find id" + id);
    }
    public PostNotFoundException(String message){
        super(message);
    }
}
