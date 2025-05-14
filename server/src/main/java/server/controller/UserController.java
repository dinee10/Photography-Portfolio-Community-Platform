package server.controller;

import server.exception.UserNotFoundException;
import server.model.UserModel;
import server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    //Insert
    @PostMapping("/user")
    public UserModel newUserModel(@RequestBody UserModel newUserModel){
        return  userRepository.save(newUserModel);
    }

    //user login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login (@RequestBody UserModel loginDetails){
        UserModel user = userRepository.findByEmail(loginDetails.getEmail())
                .orElseThrow(()->new UserNotFoundException("Email not found :"+ loginDetails.getEmail()));

        //check the pw is matches
        // Check if the password matches
        if (user.getPassword().equals(loginDetails.getPassword())) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("id", user.getId().toString()); // Return user ID as a string
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    //Display
    @GetMapping("/user")
    List<UserModel> getAllUsers(){return  userRepository.findAll();}

    @GetMapping("/user/{id}")
    UserModel getUserId(@PathVariable Long id){
        return userRepository.findById(id)
                .orElseThrow(()-> new UserNotFoundException(id));
    }

    //update
    @PutMapping("user/{id}")
    UserModel updateProfile(@RequestBody UserModel newUserModel, @PathVariable Long id){
        return userRepository.findById(id)
                .map(userModel ->  {
                    userModel.setFullname(newUserModel.getFullname());
                    userModel.setEmail(newUserModel.getEmail());
                    userModel.setPassword(newUserModel.getPassword());
                    userModel.setPhone(newUserModel.getPhone());
                    return userRepository.save(userModel);
                }).orElseThrow(()-> new UserNotFoundException(id));
    }


    //delete
    @DeleteMapping("/user/{id}")
    String deleteProfile(@PathVariable Long id){
        if (!userRepository.existsById(id)){
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
        return "User account" + id + "deleted";
    }

}
