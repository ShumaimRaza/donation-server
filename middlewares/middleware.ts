import express, { Express, Request, Response } from 'express';
import { IUser } from '../models/User';

export const checkTier = (req: Request, res: Response, next: Function) => {
    if (!req.user) {
        return next();
    } else {
        const user = req.user as IUser
        
    }
    next();
};

export const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'No user currently logged in' });
};

export const isManager = (req: Request, res: Response, next: Function) => {
    const user = req.user as IUser 
    if (req.isAuthenticated() && user && user.role === 'Manager') {
        return next();
    }
    return res.status(401).json({ message: 'Only Manager can perform this action' });
};