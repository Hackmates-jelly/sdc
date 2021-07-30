import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import options from '../config/config';
import './reviews.css';
import StarRating from './StarRating.jsx';
import ImageModal from './ImageModal.jsx';

const ReviewListItem = ({ review }) => {
  // console.log('current review', review);
  const [helpfull, setHelpfull] = useState(review.helpfulness);
  const [reported, setReported] = useState(false);
  const [disableHelpful, setDisableHelpful] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const handleAddHelpful = () => {
    setDisableHelpful(!disableHelpful);
    setHelpfull(() => (disableHelpful ? helpfull - 1 : helpfull + 1));
    axios.put(
      `${options.url}reviews/${review.review_id}/helpful`,
      {
        helpfulness: helpfull,
      },
      {
        headers: options.headers,
      },
    )
      .then()
      .catch((err) => {
        throw err;
      });
  };

  // TODO: which value should we update by click "report"? can't find in the reviews
  const handleReport = () => {
    setReported(!reported);
    axios.put(
      `${options.url}reviews/${review.review_id}/report`, {},
      {
        headers: options.headers,
      },
    )
      .then()
      .catch((err) => {
        throw err;
      });
  };
  // const email = 'lisa@gamil.com';
  // TODO: review.email should also match the sale system as the verified purchaser
  // TODO: repsonse from seller section
  return (
    <div>
      <div className="review-list-overall">
        <StarRating rating={review.rating} />
        <span>
          {review.reviewer_name}
          {review.email ? <span>(Verified Purchaser)</span> : null}
          {', '}
          {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div className="review-summary">{review.summary}</div>
      <div>{review.body}</div>
      <div className="photos-container">
        {review.photos.map((photo) => (
          <div key={photo.id}>
            <img
              src={photo.url}
              aria-label="save"
              alt=""
              width="30%"
              height="30%"
              onClick={() => setShowFullImage((prev) => !prev)}
              onKeyPress={() => { }}
              role="presentation"
            />
            <ImageModal
              showFullImage={showFullImage}
              url={photo.url}
              onClose={() => setShowFullImage((prev) => !prev)}
            />
          </div>

        ))}
        ;
      </div>

      <div>
        {review.recommend ? <span>&#10003; I recommend this product</span> : null}
      </div>
      {review.response ? (
        <div className="review-response">
          <strong>
            Response:
          </strong>
          <div>{review.response}</div>
        </div>
      ) : null}
      <div>
        <span>Helpful?</span>
        <span onClick={handleAddHelpful} onKeyDown={() => { }} role="link" tabIndex={0}>
          Yes(
          {helpfull}
          )
        </span>
        <span>{' | '}</span>
        <span onClick={handleReport} onKeyDown={() => { }} role="link" tabIndex={0}>
          {reported ? 'Reported' : 'Report'}
        </span>
      </div>
      <br />
    </div>
  );
};
ReviewListItem.propTypes = {
  review: PropTypes.shape({
    review_id: PropTypes.number,
    rating: PropTypes.number,
    summary: PropTypes.string,
    reviewer_name: PropTypes.string,
    date: PropTypes.string,
    body: PropTypes.string,
    photos: PropTypes.arrayOf(PropTypes.object),
    recommend: PropTypes.bool,
    helpfulness: PropTypes.number,
    email: PropTypes.string,
    response: PropTypes.string,
  }),
};
ReviewListItem.defaultProps = {
  review: {},
};
export default ReviewListItem;
