
import { Component } from '@angular/core';
import { StreamChat, ChannelData, Message, User, DefaultGenerics } from 'stream-chat';
import axios from 'axios';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent{
    title = 'Chat';
    channel?: ChannelData;
    username = '';
    messages: Message[] = [];
    newMessage = '';
    channelList?: ChannelData[];
    chatClient?: StreamChat;
    currentUser?: User;

    async joinChat() {
      const { username } = this;
      try {
        const response = await axios.post('http://localhost:5500/join', {
          username,
        });
        const { token } = response.data;
        const apiKey = response.data.api_key;
  
        this.chatClient = new StreamChat(apiKey);
        
        if(this.chatClient){
        this.currentUser = await this.chatClient.setUser(
          {
            id: username,
            name: username,
          },
          token
        );
        }
        
        this.channel = this.chatClient.channel('team', 'talkshop');
        await this.channel.watch();
        this.channel = channel;
        this.messages = this.channel.state.messages;
        if(this.channel){
        this.channel['on']('message.new', (event: { message: Message<DefaultGenerics>; }) => {
          this.messages = [...this.messages, event.message];
        });
      }

        const filter = {
          type: 'team',
          members: { $in: [`${this.currentUser.me.id}`] },
        };
        const sort = { last_message_at: -1 };
  
        this.channelList = await this.chatClient.queryChannels(filter, sort, {
          watch: true,
          state: true,
        });
      } catch (err) {
        console.log(err);
        return;
      }
    }
  
    async sendMessage() {
      if (this.newMessage.trim() === '') {
        return;
      }
  
      try {
        await this.channel.sendMessage({
          text: this.newMessage,
        });
        this.newMessage = '';
      } catch (err) {
        console.log(err);
      }
    }
  }
