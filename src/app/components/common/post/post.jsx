import React, { Component, PropTypes } from 'react';
import { setLoading } from '../../../actions/actions';
import {connect} from 'react-redux';
import { firebase, helpers } from 'redux-react-firebase';
import classNames from 'classnames';
import * as CONSTANTS from '../../../constants/constants';
import showdown from 'showdown';
import moment from 'moment';
import $ from 'jquery';
import Edit from '../lib/edit/edit';
import Icon from '../lib/icon/icon';

const defaultProps = {
	
};

const propTypes = {
	
};

const {isLoaded, isEmpty, dataToJS} = helpers;

@connect(
  	(state, props) => ({
    	post: dataToJS(state.firebase, 'posts'),
		files: dataToJS(state.firebase, 'files'),
		userID: state.mainReducer.user ? state.mainReducer.user.uid : '',
		userData: dataToJS(state.firebase, `users/${state.mainReducer.user ? state.mainReducer.user.uid : ''}`),
  	})
)
@firebase(
  	props => ([
    	`posts#orderByChild=slug&equalTo=${window.location.href.substr(window.location.href.lastIndexOf('/') + 1)}`,
		'files',
		`users/${props.userID}`
  	])
)
class Post extends Component {
    
	constructor(props) {
		super(props);
	}
	
	componentDidMount() {
		this.props.setLoading(false);
		$('.js-main').removeClass().addClass('main js-main post-page');
	}
	
	render() {
		let post = null,
			featuredImage = null;
		
		if (isLoaded(this.props.post) && isLoaded(this.props.files) && !isEmpty(this.props.post) && !isEmpty(this.props.files)) {	
			Object.keys(this.props.post).map(function(key) {
				post = this.props.post[key];
				if (post.featuredImage) {
					Object.keys(this.props.files).map(function(fileKey) {
						if (fileKey === post.featuredImage) featuredImage = this.props.files[fileKey];
					}.bind(this));
				}
			}.bind(this));
		}
		
		return (
            <section className="page post"> 
            	{post ? <div className="page-wrapper">
					<h1 className="title">{post.title}</h1>
					<div className="meta">
						<div className="date">{moment(post.date).format('Do MMMM YYYY, h:mm a')}</div>
						{isLoaded(this.props.userData) && !isEmpty(this.props.userData) && this.props.userData.info.level >= CONSTANTS.ADMIN_LEVEL ? <Edit editLink={`/admin/posts/edit/${post.slug}`} newLink="/admin/posts/new" /> : ''}
					</div>
					<div className={classNames('columns', {'single-column': (!post.content2 && !post.content2)})}>
						<div className="column page-content">
							{featuredImage ? <img className="featured-image" src={featuredImage.url} /> : ''}
							<div className="content" dangerouslySetInnerHTML={{__html: CONSTANTS.converter.makeHtml(post.content1)}}></div>
						</div>
						{post.content2 ? <div className="column page-sidebar">
							<div className="content" dangerouslySetInnerHTML={{__html: CONSTANTS.converter.makeHtml(post.content2)}}></div>
						</div> : ''}
						{post.content3 ? <div className="column page-sidebar">
							<div className="content" dangerouslySetInnerHTML={{__html: CONSTANTS.converter.makeHtml(post.content3)}}></div>
						</div> : ''}
					</div>
          		</div> : <div className="loader-small"></div>}
            </section>
		)
	}
}

Post.propTypes = propTypes;
Post.defaultProps = defaultProps;

const mapDispatchToProps = {
	setLoading
}

const mapStateToProps = ({ mainReducer: { isDesktop } }) => ({ isDesktop });

export default connect(mapStateToProps, mapDispatchToProps)(Post);