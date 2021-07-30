import { useState, useEffect } from 'react';
import axios from 'axios';
import options from '../config/config';

const useAllReviews = (productId, page, sortOption, ratingFilter) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  // every time we change the sort or product_id, empty pervious reviews
  useEffect(() => {
    setReviews([]);
  }, [sortOption, productId, ratingFilter]);

  useEffect(() => {
    const { CancelToken } = axios;
    let cancel;
    setLoading(true);
    setError(false);

    axios({
      method: 'GET',
      url: `${options.url}reviews/`,
      headers: options.headers,
      params: {
        product_id: productId,
        page,
        count: 4,
        sort: sortOption,
      },
      cancelToken: new CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        let newReviews;
        if (ratingFilter) {
          newReviews = res.data.results.filter((review) => review.rating === ratingFilter);
        } else {
          newReviews = res.data.results;
        }
        setReviews((prev) => [...prev, ...newReviews]);
        // const allReviews = [...reviews, ...newReviews];
        // const uniqueReviews = [...new Map(
        //   allReviews.map((review) => [review.review_id, review]),
        // ).values()];
        // console.log('reviews before', allReviews);
        // console.log('reviews after', uniqueReviews);
        // setReviews(uniqueReviews);
        setHasMore(res.data.results.length > 0);
        setLoading(false);
      }).catch((e) => {
        if (axios.isCancel(e)) return;
        setError(true);
      });
    return () => cancel();
  }, [productId, page, sortOption, ratingFilter]);
  // console.log('review', reviews);
  return {
    loading, error, reviews, hasMore,
  };
};

export default useAllReviews;
