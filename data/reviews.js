import { reviews } from "../config/mongoCollections";

const createReview = async (
    rating,
    reviewText,
    reviewerId, //userId of the reviewer
    activityId // Where does this come from???
) => {

    // Validate rating
    if(typeof rating !== 'number' || rating < 1 || rating > 5 || !/^\d+(\.\d)?$/.test(rating)){
        throw new Error('Rating must be a whole number between 1 and 5 with one decimal place');
    }

    // Validate review text
    if(typeof reviewText !== 'string' || reviewText.trim() === ''){
        throw new Error('Review text must be a valid non-empty string');
    }

    if(typeof reviewerId !== 'string' || reviewerId.trim() === ''){
        throw new Error('Reviewer id must be a valid non-empty string');
    }

    if(typeof activityId !== 'string' || activityId.trim() === ''){
        throw new Error('Activity Id must be a valid non-empty string');
    }

    
const reviewId = new ObjectId()
// Create new review object
const newReview = {
    _id: reviewId,
    reviewerId,
    activityId,
    rating,
    reviewText
};

const usersCollection = await users();

// Add the new review to the users's reviews array
await usersCollection.findOneAndUpdate(
  {_id: new ObjectId(reviewerId)},
  {$push: { reviews: newReview }} //We could also think of storing the review ids here, instead of storing the whole object
);


//Adding the review to reviews collection
const reviewsCollection = await reviews();
    
    await reviewsCollection.insertOne({
        _id: reviewId,
        reviewerId,
        activityId,
        rating,
        reviewText
    });

return newReview;
};

export const getAllReviews = async () => {
    const reviewsCollection = await reviews();
    let reviewsList = await reviewsCollection.find({}).toArray();
    if (!reviewsList) throw 'Could not get all reviews';
    reviewsList = reviewsList.map((element) => {
      element._id = element._id.toString();
      return element;
    });
    return reviewsList;
};

export const getReview = async (reviewId) => {
    if (!reviewId) throw 'You must provide an id to search for';
    if (typeof reviewId !== 'string') throw 'Id must be a string';
    if (reviewId.trim().length === 0)
      throw 'reviewId cannot be an empty string or just spaces';
      reviewId = reviewId.trim();
    if (!ObjectId.isValid(reviewId)) throw 'invalid object ID';
    const reviewsCollection = await reviews();
    const _review = await reviewsCollection.findOne({_id: new ObjectId(reviewId)});
    if (_review === null) throw 'No review with that id';
    _review._id = _review._id.toString();
    return _review;
};

const removeReview = async (reviewId) => {
    if (!reviewId) throw 'You must provide an reviewId to search for';
    if (typeof reviewId !== 'string') throw 'reviewId must be a string';
    if (reviewId.trim().length === 0)
      throw 'reviewId cannot be an empty string or just spaces';
      reviewId = reviewId.trim();
    if (!ObjectId.isValid(reviewId)) throw 'invalid object ID';
    const reviewsCollection = await reviews();
    const deletionInfo = await reviewsCollection.findOneAndDelete({
      _id: new ObjectId(reviewId)
    });

    if (!deletionInfo) {
      throw `Could not delete user with id of ${reviewId}`;
    }
    return `${reviewId} has been deleted.`;
};

const updateReview = async (
    reviewId,
    rating,
    reviewText
) => {
    if(typeof rating !== 'number' || rating < 1 || rating > 5 || !/^\d+(\.\d)?$/.test(rating)){
        throw new Error('Rating must be a whole number between 1 and 5 with one decimal place');
    }

    // Validate review text
    if(typeof reviewText !== 'string' || reviewText.trim() === ''){
        throw new Error('Review text must be a valid non-empty string');
    }

      if (!ObjectId.isValid(reviewId)) throw 'invalid object ID';

    const oldReview= await getReview(reviewId);

  
    const updatedReview = {
        reviewerId: oldReview.reviewerId,
        activityId: oldReview.activityId,
        rating:rating,
        reviewText:reviewText
    };

    const reviewsCollection = await reviews();
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
      {_id: new ObjectId(reviewId)},
      {$set: updatedReview},
      {returnDocument: 'after'}
    );

    if (!updatedInfo) {
      throw 'could not update review successfully';
    }

    const updated = await getReview(reviewId);

    return updated;

};