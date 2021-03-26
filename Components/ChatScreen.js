import { Avatar, IconButton } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import styled from "styled-components";
import { auth, db } from "../firebase";
import getRecipientEmail from "../utils/getRecipientEmail";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import Message from "./Message";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import SendIcon from "@material-ui/icons/Send";
import MicIcon from "@material-ui/icons/Mic";
import { useState, useRef } from "react";
import firebase from "firebase";
import TimeAgo from "timeago-react";

function ChatScreen({ chat, messages }) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const recipientEmail = getRecipientEmail(chat.users, user);
  const [input, setInput] = useState("");
  const endofMessageRef = useRef(null);

  const ScrollToBottom = () => {
    endofMessageRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const [messagesSnapshot] = useCollection(
    db
      .collection("chats")
      .doc(router.query.id)
      .collection("messages")
      .orderBy("timestamp", "asc")
  );
  const [recipientSnapshot] = useCollection(
    db
      .collection("users")
      .where("email", "==", getRecipientEmail(chat.users, user))
  );
  const recipient = recipientSnapshot?.docs?.[0]?.data();

  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          user={message.data().user}
          message={{
            ...message.data(),
            timestamp: message.data().timestamp?.toDate(),
          }}
        />
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message key={message.id} user={message.user} message={message} />
      ));
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    db.collection("users")
      .doc(user.uid)
      .set(
        { lastSeen: firebase.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );

    db.collection("chats").doc(router.query.id).collection("messages").add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: input,
      user: user.email,
      photoURL: user.photoURL,
    });
    setInput("");
    ScrollToBottom();
  };
  return (
    <Container>
      <Header>
        {recipient ? (
          <UserAvatar src={recipient?.photoURL} />
        ) : (
          <UserAvatar>{recipientEmail[0]} </UserAvatar>
        )}

        <HeaderInformation>
          <h3> {getRecipientEmail(chat.users, user)}</h3>
          {recipientSnapshot ? (
            <p>
              Last active : {""}
              {recipient?.lastSeen?.toDate() ? (
                <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
              ) : (
                "Unavailable"
              )}
            </p>
          ) : (
            <p>Loading Last Active...</p>
          )}
        </HeaderInformation>
        <HeaderRightComponent>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </HeaderRightComponent>
      </Header>
      <MessageContainer>
        {/* https://fsb.zobj.net/crop.php?r=sEgoYzFox9nu05-Z038Pe5hqtlSvcgCH0K2gF8gggQjIz1nS56tYS0oiTN48smT_eBTFwSoJ6DiC3UCXjInbRR1ywRiLLV110DNIiKBkXNwg0RoWOrtyT7p7dw1iYecetOAZfxoeBY86dSXo*/}
        {showMessages()}
        <EndofMessage ref={endofMessageRef} />
      </MessageContainer>

      <InputContainer>
        <InsertEmoticonIcon />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your Message"
        />
        <IconButton disabled={!input} type="submit" onClick={sendMessage}>
          <SendIcon />
        </IconButton>
        <IconButton>
          <MicIcon />
        </IconButton>
      </InputContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div``;
const UserAvatar = styled(Avatar)``;
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  padding: 11px;
  border-bottom: 1px solid whitesmoke;
  height: 80px;
`;
const HeaderInformation = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 15px;
  flex: 1;

  > h3 {
    margin: 0px;
    margin-bottom: 3px;
  }
  > p {
    margin: 0px;
    font-size: 14px;
    color: gray;
  }
`;
const HeaderRightComponent = styled.div``;
const MessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;
const EndofMessage = styled.div`
  margin-bottom: 50px;
`;
const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;
const Input = styled.input`
  align-items: center;
  outline: 0;
  border: none;
  border-radius: 10px;
  flex: 1;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: whitesmoke;
  z-index: 100;
`;
