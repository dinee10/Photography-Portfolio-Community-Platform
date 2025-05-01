package server.repository;

import server.model.LprogressModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LprogressRepository extends JpaRepository<LprogressModel, Long> {
}
