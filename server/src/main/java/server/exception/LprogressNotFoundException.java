package server.exception;

public class LprogressNotFoundException extends RuntimeException{
    public LprogressNotFoundException(Long id) {
        super("could not find id" + id);
    }
    public LprogressNotFoundException(String message){
        super(message);
    }
}
