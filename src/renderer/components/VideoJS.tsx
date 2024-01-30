import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.min.css';
// import offsetPlugin from 'videojs-offset';
// import { useAuth } from '../hooks/useAuth';

export const VideoJS = (props:any) => {
  const videoRef = React.useRef<any>(null);
  const playerRef = React.useRef<any>(null);
  const {options, onReady} = props;
  // const { user } = useAuth();

  // React.useEffect(() => {
  //   const playerXhrRequestHook = (options) => {
  //     options.beforeSend = (xhr:XMLHttpRequest) => {
  //       xhr.setRequestHeader('Authorization', `Bearer ${user.token}`);
  //     };
  //     return options;
  //   };
  //   videojs.Vhs.xhr.onRequest(playerXhrRequestHook);
  //   videojs.registerPlugin("offset", offsetPlugin);
  // }, []);

  React.useEffect(() => {

    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });
      // player.offset({
      //   start: options.start,
      //   end: options.end,
      //   restart_beginning: false //Should the video go to the beginning when it ends
      // });
    // You could update an existing player in the `else` block here
    // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
      player.offset({
        start: options.start,
        end: options.end,
        restart_beginning: false //Should the video go to the beginning when it ends
      });
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
}

export default VideoJS;
