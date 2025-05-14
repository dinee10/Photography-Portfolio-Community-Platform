package server.repository;

import server.model.LprogressModel;
import org.springframework.data.jpa.repository.JpaRepository;
import server.model.UserModel;

import java.util.List;

public interface LprogressRepository extends JpaRepository<LprogressModel, Long> {
    List<LprogressModel> findByUser(UserModel user);
}
