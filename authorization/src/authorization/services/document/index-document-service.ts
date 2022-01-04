import { BadRequestError, DocumentStatus } from '@digidocs/guardian';
import { Types } from 'mongoose';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import { IDocument } from 'authorization-service/models/Document';
import User, { IUser } from 'authorization-service/models/User';
import { IDocumentActions } from 'authorization-service/models/Actions';
import { findUserStatus } from 'authorization-service/utils/find-user-status';
import { Request, Response } from 'express';

export interface IDocQuery {
  page?: string;
  limit?: string;
}

const indexDocumentService = async (
  userId: string,
  query: IDocQuery,
  req: Request,
  res: Response
) => {
  try {
    const { page = '1', limit = '10' } = query;
    const { dbQueries } = res.locals;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const documentUserMapsArr = await DocumentUserMap.aggregate([
      {
        $match: {
          $and: [
            {
              user: Types.ObjectId(userId),
            },
            {
              access: true,
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'documents',
          localField: 'document',
          foreignField: '_id',
          as: 'document',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'actions',
          localField: 'action',
          foreignField: '_id',
          as: 'action',
        },
      },
      {
        $unwind: {
          path: '$document',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $unwind: {
          path: '$action',
        },
      },
      {
        $match: dbQueries,
      },
      {
        $sort: { updatedAt: -1 },
      },

      {
        $facet: {
          paginatedResults: [
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },

    ]);

    const totalPages = Math.ceil(documentUserMapsArr[0].totalCount[0].count / limitNum);

    const documentUserMaps = documentUserMapsArr[0].paginatedResults;

    const documents = await Promise.all(
      documentUserMaps.map(async (docUserMap: any) => {
        const document = docUserMap.document as IDocument;
        const actions = [] as IDocumentActions[];
        const recipient = docUserMap.user as IUser;

        const docUserMapsForDoc = await DocumentUserMap.find({
          document: document._id,
        })
          .populate('action')
          .populate('user');

        docUserMapsForDoc.map(docUserMapForDoc => {
          const action = docUserMapForDoc.action as IDocumentActions;
          actions.push(action);
        });

        const user = (await User.findById(document.userId).select(
          '-socialAuthToken -refreshToken -password'
        )) as IUser;

        const actionList: any[] = [];

        if (actions && actions.length) {
          actions.map(action => {
            actionList.push({
              type: action.type,
              email: action.recipientEmail,
              status: action.actionStatus,
              name:
                action.recipientName ??
                `${recipient.firstname ?? ''} ${recipient.lastname ?? ''}`,
              signOrder: action.signOrder,
            });
          });
        }

        return {
          documentName: document.name,
          documentId: document._id,
          ownerName: `${user?.firstname || ''} ${user?.lastname || ''}`,
          createdAt: document.createdAt,
          status: document.status || DocumentStatus.DRAFTS,
          userStatus: findUserStatus(userId, docUserMapsForDoc),
          actions: actionList,
        };
      })
    );

    return { documents, totalPages, currentPage: pageNum };
  } catch (err) {
    console.log(err);
    throw new BadRequestError('Unable to get Document details');
  }
};

export default indexDocumentService;
