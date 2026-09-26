import { create } from 'domain';
import express from 'express';
import {createServer} from 'http';
import {server} from 'socket.io';

const app = express();
const server = createServer(app);

const io = new Server(server , {
  cors : {
    origin : 'http://localhost:3000',
    methods : ['GET' , 'POST'],
  },
});