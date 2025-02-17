import axios from 'axios';
import {
  funcs,
  IEmployeeHook,
  IEmployeeSignUp,
  IEnterpriseAssign,
  IEntityId,
  IEventInfo,
  IFacultyAssign,
  IResponse,
  IUserAuthentication,
  IUserInfo,
  IUserRecieve,
} from 'project-w-backend';
import { reactive } from 'vue';

const API_URL = '/api/v1';

export const alert = reactive<IAlert>({ message: '', type: 'none' }),
  state = reactive<AuthState>({ user: null, token: null });

interface AuthState {
  user: null | IUserInfo | string;
  token: null | IUserRecieve;
}

export async function action(
  type: 'login' | 'signup' | 'logout' | 'change-password' | 'request-signature',
  input: Required<IUserAuthentication>,
): Promise<IResponse>;
export async function action(
  type: 'EventUpdate',
  input: IEventInfo & IEntityId,
): Promise<IResponse>;
export async function action(
  type: 'EventAssign',
  input: IEventInfo,
): Promise<IResponse>;
export async function action(
  type: 'EnterpriseAssign',
  input: IEnterpriseAssign,
): Promise<IResponse>;
export async function action(
  type: 'FacultyAssign',
  input: IFacultyAssign,
): Promise<IResponse>;
export async function action(
  type: 'EmployeeSignUp',
  input: IEmployeeSignUp,
): Promise<IResponse>;
export async function action(
  type: 'EmployeeHook',
  input: IEmployeeHook,
): Promise<IResponse>;
export async function action(
  type:
    | 'login'
    | 'signup'
    | 'logout'
    | 'change-password'
    | 'request-signature'
    | 'EmployeeHook'
    | 'EventAssign'
    | 'EventUpdate'
    | 'EnterpriseAssign'
    | 'FacultyAssign'
    | 'EmployeeSignUp',
  input:
    | IEmployeeHook
    | IEmployeeSignUp
    | IEventInfo
    | (IEventInfo & IEntityId)
    | IEnterpriseAssign
    | IFacultyAssign
    | Required<IUserAuthentication>,
): Promise<IResponse> {
  let url = API_URL;

  switch (type) {
    case 'EventAssign':
      url += '/event/assign';
      break;

    case 'EventUpdate':
      url += '/event/update';
      break;

    case 'EnterpriseAssign':
      url += '/enterprise/assign';
      break;

    case 'FacultyAssign':
      url += '/faculty/assign';
      break;

    case 'EmployeeSignUp':
      url += '/employee/signup';
      break;

    case 'EmployeeHook':
      url += '/employee/hook';
      break;

    default:
      url += '/' + type;
      break;
  }

  const { token } = (await axios.get(`${API_URL}/csrf-token`)).data,
    { data } = await axios.post(url, input, {
      headers: { 'csrf-token': token },
    });

  return data;
}

export type IObject =
  | 'account'
  | 'password'
  | 'signature'
  | 'api'
  | 'role'
  | 'enterprise';

export interface IAlert {
  message: string;
  type: 'success' | 'error' | 'processing' | 'none';
  object?: IObject;
}

export async function apiErrorHandler(response: Promise<IResponse>) {
  alert.message = '';
  alert.type = 'processing';

  try {
    switch ((await response).message) {
      case funcs.err('Success', 'Signature', 'Sent'):
        alert.message =
          'An email has sent to your email address, please check inbox and spam';
        alert.type = 'error';
        alert.object = 'account';
        break;

      case 'Success_Change_Password':
        alert.message = 'Password changed successfully';
        alert.type = 'success';
        alert.object = 'password';
        break;

      case 'Sent_Signature_Console':
        alert.message = 'Please copy signature from console';
        alert.type = 'success';
        alert.object = 'signature';
        break;

      case 'Success_Assign_Enterprise':
        alert.message = 'Enterprise assigned successfully';
        alert.type = 'success';
        alert.object = 'account';
        break;

      default:
        break;
    }
  } catch (e) {
    switch (
      (e as { response: { data: { message: string } } }).response.data.message
    ) {
      case 'Invalid_Password':
        alert.message = 'Wrong password, please re-enter your password';
        alert.type = 'error';
        alert.object = 'password';
        break;

      case 'Invalid_Email':
        alert.message = 'Email not found, please re-enter your email';
        alert.type = 'error';
        alert.object = 'account';
        break;

      case 'Invalid_Hook_Signature':
      case 'Invalid_Hook_Cookie':
        alert.message =
          'Signature has been out of dated, please request new signature';
        alert.type = 'error';
        alert.object = 'signature';
        break;

      case 'Internal server error':
      case 'Unauthorized':
        alert.message = 'Something went wrong after sent your request';
        alert.type = 'error';
        alert.object = 'api';
        break;

      case 'Exist_User':
        alert.message = 'This email address has been assigned to an account';
        alert.type = 'error';
        alert.object = 'account';
        break;

      case 'Invalid_Enterprise_Name':
        alert.message = 'Invalid enterprise name';
        alert.type = 'error';
        alert.object = 'enterprise';
        break;

      default:
        break;
    }
  }
}
