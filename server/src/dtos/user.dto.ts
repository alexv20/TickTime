import { IUser } from '../types/user.types';

class UserDto {
  email;
  id;
  isActivated;

  constructor(model: IUser) {
    this.email = model.email;
    this.id = model.id;
    this.isActivated = model.isActivated;
  }
}

export default UserDto;
