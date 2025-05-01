package server.repository;

import server.model.BlogModel;
import org.springframework.data.jpa.repository.JpaRepository;


public interface BlogRepository extends JpaRepository <BlogModel, Long>{
}
