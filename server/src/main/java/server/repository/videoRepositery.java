package server.repository;

import server.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;

public interface videoRepositery extends JpaRepository <Video,Long> {
}
