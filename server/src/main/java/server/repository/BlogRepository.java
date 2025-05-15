package server.repository;

import server.model.BlogModel;
import server.model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlogRepository extends JpaRepository<BlogModel, Long> {
    List<BlogModel> findByUser(UserModel user);
}