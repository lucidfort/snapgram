import { INewComment } from "@/types";
import { appwriteConfig, databases } from "../config";
import { ID, Query } from "appwrite";
import { createNotification } from "./users";

export async function createComment(comment: INewComment, postCreatorId: string) {
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      {
        commenter: comment.commenterId,
        post: comment.postId,
        quote: comment.quote,
      }
    );

    if (!newComment) throw Error;

    if (comment.commenterId !== postCreatorId) {
      await createNotification({
        type: "comment",
        targetId: postCreatorId,
        userId: comment.commenterId,
        postId: comment.postId,
      })
    }

    return newComment;
  } catch (error) {
    console.log(error);
  }
}

export async function getComments(postId: string) {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("post", postId),
        // Query.select([
        //   "$id",
        //   "quote",
        //   "likes",
        //   "$createdAt",
        //   "commenter.$id",
        //   "commenter.name",
        //   "commenter.imageUrl",
        // ]),
      ]
    );

    if (!comments) throw Error;

    return comments;
  } catch (error) {
    console.log(error);
  }
}

export async function likeComment(commentId: string, likes: string[]) {
  try {
    const updatedComment = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId,
      {
        likes: likes,
      }
    );

    if (!updatedComment) throw Error;

    return updatedComment;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteComment(commentId: string) {
  try {
    const commentToDelete = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    if (!commentToDelete) throw Error;

    return { success: true };
  } catch (error) {
    console.log(error);
  }
}