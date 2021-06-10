import * as express from "express";
import { IncomingHttpHeaders } from "http";

interface IHeaders extends IncomingHttpHeaders {
  'x-auth': string
  'x-auth-test': string
  'x-cc-webhook-signature': string
}
export interface IRequest extends express.Request {
  uid: string;
  res: IResponse;
  rawBody: string;
  headers: IHeaders
}
export interface IResponse extends express.Response {
  // something custom ...
}
