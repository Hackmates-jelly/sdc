import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import options from '../../config/config.js';
import helperMethods from '../../../reviewRequest.js';
import { ExpandContext } from '../Overview.jsx';
import calculateRating from '../../../helper.js';
import StarRating from '../../RatingsAndReviews/StarRating.jsx'
import style from './ProductInfo.module.css';

const ProductInfo = () => {
  const contextData = useContext(ExpandContext);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReview, setTotalReview] = useState(0);
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    helperMethods.getReviewsMeta(contextData.currState.productId)
      .then((res) => {
        setAverageRating(calculateRating(res.ratings).averageRatings);
        setTotalReview(calculateRating(res.ratings).totalReviews);
      })
      .catch((err) => {
        console.log('review star data fetching error', err);
      });
    axios.get(`${options.url}products/${contextData.currState.productId}`, { headers: options.headers })
      .then((response) => {
        setCategory(response.data.category);
        setProductName(response.data.name);
        setPrice(response.data.default_price);
      })
      .catch((err) => {
        console.log('styles data fetching err', err);
      });
  }, []);

  return (
    <div>
      <div style={{ display: 'inline-block' }}>
        <StarRating rating={averageRating} />
      </div>
      <a href="#" className={style.linkToReviewComponent}>{totalReview}</a>
      <h4 className={style.category}>{category}</h4>
      <h1 className={style.title}>{productName}</h1>
      <p>${price}</p>
    </div>
  );
};

export default ProductInfo;
