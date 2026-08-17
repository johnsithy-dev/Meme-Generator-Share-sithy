import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  toggleLike,
  addComment,
  fetchComments,
  deleteComment,
  toggleCommentLike,
  getUserProfile,
} from '../firebase.js';

function buildCommentTree(flatComments) {
  const byParent = {};
  flatComments.forEach((c) => {
    const key = c.parentId || 'root';
    if (!byParent[key]) byParent[key] = [];
    byParent[key].push(c);
  });
  return byParent;
}

function saveScrollPosition() {
  sessionStorage.setItem('ma-scroll:' + window.location.pathname, String(window.scrollY));
}

function CommentItem({ memeId, meme, comment, tree, depth, user, isAdmin, onDeleted, onReplyPosted }) {
  const [likedBy, setLikedBy] = useState(comment.likedBy || []);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);
  const { profile } = useAuth();

  const isLiked = user && likedBy.includes(user.uid);
  const replies = tree[comment.id] || [];

  async function handleToggleLike() {
    if (!user) return;
    const wasLiked = isLiked;
    setLikedBy((prev) => (wasLiked ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]));
    try {
      await toggleCommentLike(memeId, comment.id, user.uid, wasLiked);
    } catch (err) {
      console.error(err);
      setLikedBy((prev) => (wasLiked ? [...prev, user.uid] : prev.filter((id) => id !== user.uid)));
    }
  }

  async function handleReplySubmit(e) {
    e.preventDefault();
    if (!user || !replyText.trim()) return;
    setPosting(true);
    try {
      await addComment(memeId, {
        text: replyText.trim(),
        author: profile?.displayName || user.email,
        authorId: user.uid,
        parentId: comment.id,
      });
      onReplyPosted({
        id: 'temp-' + Date.now(),
        text: replyText.trim(),
        author: profile?.displayName || user.email,
        authorId: user.uid,
        parentId: comment.id,
        likedBy: [],
      });
      setReplyText('');
      setShowReplyBox(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteComment(memeId, comment.id);
      onDeleted(comment.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="ma-comment-thread" style={{ marginLeft: depth * 18 }}>
      <div className="ma-comment">
        <span className="ma-comment-author">@{comment.author}</span>
        <span className="ma-comment-text">{comment.text}</span>
      </div>
      <div className="ma-comment-actions">
        <button
          className={`ma-comment-like ${isLiked ? 'liked' : ''}`}
          onClick={handleToggleLike}
          disabled={!user}
          title={user ? (isLiked ? 'Unlike' : 'Like') : 'Log in to like'}
        >
          {isLiked ? '❤️' : '🤍'} {likedBy.length > 0 ? likedBy.length : ''}
        </button>
        {user && (
          <button className="ma-comment-reply-btn" onClick={() => setShowReplyBox((v) => !v)}>
            Reply
          </button>
        )}
        {user && (user.uid === comment.authorId || user.uid === meme.authorId || isAdmin) && (
          <button className="ma-comment-delete" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>

      {showReplyBox && (
        <form className="ma-comment-form ma-reply-form" onSubmit={handleReplySubmit}>
          <input
            className="ma-input"
            placeholder={`Reply to @${comment.author}…`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            maxLength={200}
            autoFocus
          />
          <button className="ma-btn primary" type="submit" disabled={posting || !replyText.trim()}>
            Reply
          </button>
        </form>
      )}

      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          memeId={memeId}
          meme={meme}
          comment={reply}
          tree={tree}
          depth={depth + 1}
          user={user}
          isAdmin={isAdmin}
          onDeleted={onDeleted}
          onReplyPosted={onReplyPosted}
        />
      ))}
    </div>
  );
}

export default function MemeCard({ meme, autoOpen = false }) {
  const { user, profile, isAdmin } = useAuth();
  const isVerified = user?.emailVerified;
  const [likedBy, setLikedBy] = useState(meme.likedBy || []);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [authorProfile, setAuthorProfile] = useState(null);

  const isLiked = user && likedBy.includes(user.uid);
  const tree = buildCommentTree(comments);
  const topLevelComments = tree['root'] || [];

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setShowPin(false);
    }
    if (showPin) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showPin]);
  useEffect(() => {
  if (autoOpen) {
    openPin();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [autoOpen]);

  async function openPin() {
    setShowPin(true);
    if (comments.length === 0) {
      setLoadingComments(true);
      try {
        const data = await fetchComments(meme.id);
        setComments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
    if (meme.authorId && !authorProfile) {
      try {
        const p = await getUserProfile(meme.authorId);
        setAuthorProfile(p);
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleToggleLike() {
    if (!user) return;
    const wasLiked = isLiked;
    setLikedBy((prev) => (wasLiked ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]));
    try {
      await toggleLike(meme.id, user.uid, wasLiked);
    } catch (err) {
      console.error(err);
      setLikedBy((prev) => (wasLiked ? [...prev, user.uid] : prev.filter((id) => id !== user.uid)));
    }
  }

  function handleDownload() {
    const link = document.createElement('a');
    link.download = (meme.title ? meme.title.replace(/\s+/g, '_') : 'meme') + '.jpg';
    link.href = meme.imageUrl;
    link.click();
  }

  async function handleShare() {
  const shareUrl = `${window.location.origin}/meme/${meme.id}`;
  const shareData = {
    title: meme.title || 'Check out this meme',
    text: meme.title || 'Check out this meme!',
    url: shareUrl,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // user cancelled, ignore
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error(err);
    }
  }
}

  async function handlePostComment(e) {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    setPosting(true);
    try {
      await addComment(meme.id, {
        text: commentText.trim(),
        author: profile?.displayName || user.email,
        authorId: user.uid,
        parentId: null,
      });
      setComments((prev) => [
        ...prev,
        {
          id: 'temp-' + Date.now(),
          text: commentText.trim(),
          author: profile?.displayName || user.email,
          authorId: user.uid,
          parentId: null,
          likedBy: [],
        },
      ]);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  }

  function handleCommentDeleted(commentId) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  function handleReplyPosted(newReply) {
    setComments((prev) => [...prev, newReply]);
  }

  return (
    <>
      <div className="ma-sticker">
        <button className="ma-sticker-img-btn" onClick={openPin}>
          <img src={meme.imageUrl} alt={meme.title || 'meme'} />
        </button>

        {meme.title && <div className="ma-sticker-title">{meme.title}</div>}

        <div className="ma-sticker-meta">
          {meme.authorId ? (
            <Link to={`/u/${meme.authorId}`} className="ma-sticker-author-link" onClick={saveScrollPosition}>
              @{meme.author || 'anonymous'}
            </Link>
          ) : (
            <span className="ma-sticker-author">@{meme.author || 'anonymous'}</span>
          )}
          <span>{meme.createdAt?.toDate ? meme.createdAt.toDate().toLocaleDateString() : ''}</span>
        </div>

        <div className="ma-card-actions">
          <button
            className={`ma-like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleToggleLike}
            disabled={!user}
            title={user ? (isLiked ? 'Unlike' : 'Like') : 'Log in to like'}
          >
            {isLiked ? '♥' : '♡'} {likedBy.length}
          </button>
          <button className="ma-comment-toggle" onClick={openPin}>
            💬 {comments.length > 0 ? comments.length : ''}
          </button>
        </div>

        <div className="ma-card-actions">
          <button className="ma-btn ghost ma-small-btn" onClick={handleDownload}>⬇ Download</button>
          <button className="ma-btn ghost ma-small-btn" onClick={handleShare}>↗ Share</button>
        </div>
      </div>

      {showPin && (
        <div className="ma-modal-overlay" onClick={() => setShowPin(false)}>
          <div className="ma-pin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ma-modal-close ma-pin-close" onClick={() => setShowPin(false)} aria-label="Close">
              ✕
            </button>

            <div className="ma-pin-image-col">
              <img src={meme.imageUrl} alt={meme.title || 'meme'} />
            </div>

            <div className="ma-pin-side-col">
              <div className="ma-pin-actions">
                <button
                  className={`ma-like-btn ${isLiked ? 'liked' : ''}`}
                  onClick={handleToggleLike}
                  disabled={!user}
                  title={user ? (isLiked ? 'Unlike' : 'Like') : 'Log in to like'}
                >
                  {isLiked ? '♥' : '♡'} {likedBy.length}
                </button>
                <button className="ma-btn ghost ma-small-btn" onClick={handleDownload}>⬇ Download</button>
                <button className="ma-btn ghost ma-small-btn" onClick={handleShare}>↗ Share</button>
              </div>

              {meme.title && <h3 className="ma-pin-title">{meme.title}</h3>}

              {meme.authorId ? (
                <Link
                  to={`/u/${meme.authorId}`}
                  className="ma-pin-author"
                  onClick={() => {
                    saveScrollPosition();
                    setShowPin(false);
                  }}
                >
                  <span className="ma-avatar-link" style={{ width: 32, height: 32 }}>
                    {authorProfile?.photoURL ? (
                      <img src={authorProfile.photoURL} alt="" />
                    ) : (
                      <span style={{ fontSize: 13 }}>{(meme.author || '?')[0].toUpperCase()}</span>
                    )}
                  </span>
                  <span>@{meme.author || 'anonymous'}</span>
                </Link>
              ) : (
                <div className="ma-pin-author">
                  <span className="ma-avatar-link" style={{ width: 32, height: 32 }}>
                    <span style={{ fontSize: 13 }}>{(meme.author || '?')[0].toUpperCase()}</span>
                  </span>
                  <span>@{meme.author || 'anonymous'}</span>
                </div>
              )}

              <div className="ma-pin-comments">
                {loadingComments && <div className="ma-loading" style={{ padding: 10 }}>loading&hellip;</div>}
                {!loadingComments && topLevelComments.length === 0 && (
                  <div className="ma-comment-empty">No comments yet. Be the first!</div>
                )}
                {!loadingComments &&
                  topLevelComments.map((c) => (
                    <CommentItem
                      key={c.id}
                      memeId={meme.id}
                      meme={meme}
                      comment={c}
                      tree={tree}
                      depth={0}
                      user={user}
                      isAdmin={isAdmin}
                      onDeleted={handleCommentDeleted}
                      onReplyPosted={handleReplyPosted}
                    />
                  ))}
              </div>

              {user && isVerified ? (
                <form className="ma-comment-form ma-pin-comment-form" onSubmit={handlePostComment}>
                  <input
                    className="ma-input"
                    placeholder="Add a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={200}
                  />
                  <button className="ma-btn primary" type="submit" disabled={posting || !commentText.trim()}>
                    Post
                  </button>
                </form>
              ) : (
                <div className="ma-comment-empty">
                  {user ? 'Please verify your email to comment.' : 'Log in to comment.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}