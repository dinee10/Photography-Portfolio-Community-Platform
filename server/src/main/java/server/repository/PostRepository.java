package server.repository;

import server.model.UserModel;
import server.model.PostModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<PostModel, Long> {
    List<PostModel> findByUser(UserModel user);
}