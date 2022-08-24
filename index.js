import React, { useState } from 'react';
import { StyleSheet, Modal, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Header } from './components/Header';
import Progress from './components/Progress';
import linkifyHtml from 'linkify-html';
import { colors } from './res';

const BeautyWebView = ({
  animationType,
  backgroundColor,
  cacheEnabled,
  cacheMode,
  closeIcon,
  copyLinkTitle,
  extraMenuItems,
  headerBackground, // default #fff
  headerContainerStyle,
  headerContent, // 'dark' || 'light', default 'dark'
  incognito,
  loadingText,
  menuIcon,
  navigationVisible,
  onGoBack,
  onGoForward,
  onLoadEnd,
  onLoadStart,
  onPressClose,
  openBrowserTitle,
  progressBarType, // 'normal' || 'background'
  progressColor,
  progressHeight,
  title,
  url, // Required
  visible,
}) => {
  const [progressRef, setProgressRef] = useState(null);
  const [backgroundProgressRef, setBackgroundProgressRef] = useState(null);
  // const [title, setTitle] = useState(loadingText); // 🙄 should be just, title.
  // const [loadingText, setloadingText] = useState(loadingText);
  // const [title, setTitle] = useState(title);
  const [backQueue, setBackQueue] = useState([]);
  const [forwardQueue, setForwardQueue] = useState([]);
  const [currentUrl, setCurrentUrl] = useState(url);

  const onProgress = (progress) => {
    progressRef?.startAnimation(progress);
    progressBarType === 'background' && backgroundProgressRef?.startAnimation(progress);
  };

  const onNavigationStateChange = (event) => {
    if (currentUrl === event.url) return;
    backQueue.push(currentUrl);
    setBackQueue(backQueue);
    onGoForward && onGoForward();
    setCurrentUrl(event.url);
  }

  const onPressBack = () => {
    if (backQueue.length == 0) return;
    const newUrl = backQueue[backQueue.length - 1];
    forwardQueue.push(currentUrl);
    setForwardQueue(forwardQueue);
    onGoBack && onGoBack();
    backQueue.pop();
    setBackQueue(backQueue);
    setCurrentUrl(newUrl);
  }

  const onPressForward = () => {
    if (forwardQueue.length == 0) return;
    const newUrl = forwardQueue[forwardQueue.length - 1];
    backQueue.push(currentUrl);
    setBackQueue(backQueue);
    forwardQueue.pop();
    setForwardQueue(forwardQueue);
    setCurrentUrl(newUrl);
    onGoForward && onGoForward();
  }

  const onClose = () => {
    onPressClose && onPressClose();
    setTimeout(() => {
      setBackQueue([]);
      setForwardQueue([]);
      setCurrentUrl(url);
    }, 200);
  }

  const converturl = linkifyHtml(currentUrl);
  const platform = Platform.OS === 'ios' ? {uri: currentUrl} : {html: converturl};
  console.log(converturl);
  return (
    <Modal visible={visible} transparent={false} animationType={animationType}>
      <View style={[styles.container, { backgroundColor: backgroundColor }]}>
        <Header
          backgroundColor={headerBackground}
          backgroundProgressRefOnChange={setBackgroundProgressRef}
          canback={backQueue.length > 0}
          canForward={forwardQueue.length > 0}
          closeIcon={closeIcon}
          headerContainerStyle={headerContainerStyle}
          contentType={headerContent}
          copyLinkTitle={copyLinkTitle}
          extraMenuItems={extraMenuItems}
          loadingText={loadingText}
          menuIcon={menuIcon}
          navigationVisible={navigationVisible}
          onPressBack={onPressBack}
          onPressClose={onClose}
          onPressForward={onPressForward}
          openBrowserTitle={openBrowserTitle}
          title={title}
          url={currentUrl}
        />
        {
          progressBarType === 'normal' &&
          <Progress
            height={progressHeight}
            color={progressColor}
            ref={(progress) => setProgressRef(progress)}
          />
        }
        <WebView
          source={ platform }
          onLoadProgress={({ nativeEvent }) => {
            let loadingProgress = nativeEvent.progress;
            onProgress(loadingProgress);
          }}
          injectedJavaScript={`window.ReactNativeWebView.postMessage(document.title||'${title}')`}
          // onMessage={event => setTitle(event.nativeEvent.data)}
          onLoadEnd={onLoadEnd}
          onLoadStart={onLoadStart}
          onNavigationStateChange={onNavigationStateChange}
          incognito={incognito}
          cacheEnabled={cacheEnabled}
          cacheMode={cacheMode}
          javaScriptEnabled
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

BeautyWebView.defaultProps = {
  transparent: true,
  backgroundColor: colors.defaultBackground,
  headerContent: 'dark',
  headerBackground: colors.defaultBackground,
  progressColor: colors.progress,
  progressHeight: 4,
  loadingText: 'Loading...',
  copyLinkTitle: 'Copy Link',
  openBrowserTitle: 'Open on Browser',
  animationType: "slide",
  progressBarType: "normal",
  navigationVisible: true
}

export default BeautyWebView;
