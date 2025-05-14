package server.model;

import jakarta.persistence.*;

import java.time.LocalDate;


@Entity
public class LprogressModel {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String topic;
    private String description;
    private String status;            // e.g., Started, In Progress, Completed
    private String image;
    private String tag;

    private LocalDate createdAt; // Changed to LocalDate
    private LocalDate updatedAt; // Changed to LocalDate

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserModel user;

    public LprogressModel(){

    }

    public LprogressModel(Long id, String name, String topic, String description, String status, String image, String tag, LocalDate createdAt, LocalDate updatedAt, UserModel user) {
        this.id = id;
        this.name = name;
        this.topic = topic;
        this.description = description;
        this.status = status;
        this.image = image;
        this.tag = tag;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDate updatedAt) {
        this.updatedAt = updatedAt;
    }

    public UserModel getUser() {
        return user;
    }

    public void setUser(UserModel user) {
        this.user = user;
    }
}
