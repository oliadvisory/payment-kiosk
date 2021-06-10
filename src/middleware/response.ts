import { Request, Response, Application, NextFunction, ErrorRequestHandler } from 'express';
import { AuthenticationError } from './../err'

export function customResponseHandler(app: Application) {

    /**
     * handles and returns a custom error response 
     * NOTE: TSOA by default sends an html error response with stack details
     * this method overrides it so that the user doesn't see the stack trace details
     *
     * @param {ErrorRequestHandler} error
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    const errorResponse = (error: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {

        if (error instanceof AuthenticationError) {

            res.statusCode = 401
            res.send(error.message)
            return
        }

        res.statusCode = 500
        res.send(error)

    }

    app.use(errorResponse)

}
