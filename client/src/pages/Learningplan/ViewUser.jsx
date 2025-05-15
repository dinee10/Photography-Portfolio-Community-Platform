import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function ViewUser() {
    const [user, setUser] = useState({
        id: "",
        name: "",
        email: "",
        age: "",
        description: ""
    });
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const { id } = useParams();

    useEffect(() => {
        loadUser();
        loadComments();
    }, [id]);

    const loadUser = async () => {
        try {
            const result = await axios.get(`http://localhost:8080/api/v1/users/${id}`);
            setUser(result.data);
        } catch (error) {
            console.error("Error loading user:", error);
            alert("Failed to load lesson. Make sure the server is running and the ID exists.");
        }
    };

    const loadComments = async () => {
        try {
            const result = await axios.get(`http://localhost:8080/api/v1/users/${id}/comments`);
            setComments(result.data);
        } catch (error) {
            console.error("Error loading comments:", error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await axios.post(`http://localhost:8080/api/v1/users/${id}/comments`, {
                content: newComment,
                createdAt: new Date().toISOString()
            });
            setComments([...comments, response.data]);
            setNewComment("");
        } catch (error) {
            console.error("Error posting comment:", error);
            alert("Failed to post comment.");
        }
    };

    return (
        <div className='container'>
            <div className='row'>
                <div className='col-md-6 offset-md-3 border rounded p-4 mt-2 shadow'>
                    <h2 className='text-center m-4'>View Lesson</h2>

                    <div className='card'>
                        <div className='card-header'>
                            Details of lesson id: {user.id}
                            <ul className='list-group list-group-flush'>
                                <li className='list-group-item'>
                                    <b>Lesson Name : </b> {user.name}
                                </li>
                                <li className='list-group-item'>
                                    <b>Teacher's Email : </b> {user.email}
                                </li>
                                <li className='list-group-item'>
                                    <b>Views : </b> {user.age}
                                </li>
                                <li className='list-group-item'>
                                    <b>Video Link : </b> {user.description}
                                </li>
                            </ul>
                        </div>
                    </div>

                  

                    <Link className='btn btn-primary my-2' to={"/"}>Back to Home</Link>
                </div>
            </div>
        </div>
    );
}

export default ViewUser;