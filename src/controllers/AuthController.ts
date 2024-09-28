import type { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (request: Request, response: Response) => {
    try {
      const { password, email } = request.body; // Desestructurar la petición del body

      // Validar si existe el usuario
      const userExists = await User.findOne({email}); // Buscar por el correo
      if(userExists) {
        const error = new Error('El usuario ya está registrado');
        return response.status(409).json({error: error.message}); // Retornar la respuesta en JSON con estado 409
      }

      // Hashear la contraseña
      const user = new User(request.body);
      user.password = await hashPassword(password);

      // Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Enviar el email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      });

      await Promise.allSettled([user.save(), token.save()]);
      response.send('Cuenta creada. Revisa tu correo electrónico para su verificación')
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'})  
    }
  }

  static confirmAccount = async (request: Request, response: Response) => {
    try {
      const { token } = request.body;
      
      // Validar si existe el token
      const tokenExists = await Token.findOne({token}); // Retornar el token encontrado. Caso contrario retorna null
      if(!tokenExists) {
        const error = new Error('El token no es válido');
        return response.status(404).json({error: error.message});
      }

      // Confirmar la cuenta con el token válido
      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      response.send('Cuenta confirmada correctamente');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'})  
    }
  }

  static login = async (request: Request, response: Response) => {
    try {
      const { email, password } = request.body;

      // Validar si existe el correo
      const user = await User.findOne({email});
      if(!user) {
        const error = new Error('Usuario no encontrado');
        return response.status(404).json({error: error.message});
      }
      
      // Validar si el correo está verificado
      if(!user.confirmed) {
        // Generar el token
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();

        // Enviar el email
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token
        });

        await token.save();
        const error = new Error('La cuenta no ha sido confirmada. Hemos enviado un correo de confirmación');
        return response.status(401).json({error: error.message});
      }

      // Validar si la contraseña es correcta
      const isPasswordCorrect = await checkPassword(password, user.password);
      if(!isPasswordCorrect) {
        const error = new Error('La contraseña es incorrecta');
        return response.status(401).json({error: error.message});
      }

      // Generar el JWT
      const token = generateJWT({id: user.id});
      response.send(token);
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'})  
    }
  }

  static requestConfirmationCode = async (request: Request, response: Response) => {
    try {
      const { email } = request.body; // Desestructurar la petición del body

      // Validar si existe el usuario
      const user = await User.findOne({email}); // Buscar por el correo
      if(!user) {
        const error = new Error('El usuario no está registrado');
        return response.status(404).json({error: error.message}); // Retornar la respuesta en JSON con estado 409
      }
      
      // Validar si el usuario confirmado vuelve a confirmarse
      if(user.confirmed) {
        const error = new Error('El usuario ya está confirmado');
        return response.status(403).json({error: error.message}); // Retornar la respuesta en JSON con estado 409
      }

      // Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Enviar el email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      });

      await Promise.allSettled([user.save(), token.save()]);
      response.send('Se envió un nuevo token a tu correo')
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'})  
    }
  }

  static forgotPassword = async (request: Request, response: Response) => {
    try {
      const { email } = request.body; // Desestructurar la petición del body

      // Validar si existe el usuario
      const user = await User.findOne({email}); // Buscar por el correo
      if(!user) {
        const error = new Error('El usuario no está registrado');
        return response.status(404).json({error: error.message}); // Retornar la respuesta en JSON con estado 409
      }

      // Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      // Enviar el email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token
      });

      response.send('Revisa tu correo electrónico para instrucciones');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'})  
    }
  }

  static validateToken = async (request: Request, response: Response) => {
    try {
      const { token } = request.body;
      
      // Validar si existe el token
      const tokenExists = await Token.findOne({token}); // Retornar el token encontrado. Caso contrario retorna null
      if(!tokenExists) {
        const error = new Error('El token no es válido');
        return response.status(404).json({error: error.message});
      }

      response.send('Token válido, define tu nueva contraseña');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'})  
    }
  }

  static updatePasswordWithToken = async (request: Request, response: Response) => {
    try {
      const { token } = request.params;
      const { password } = request.body;
      
      // Validar si existe el token
      const tokenExists = await Token.findOne({token}); // Retornar el token encontrado. Caso contrario retorna null
      if(!tokenExists) {
        const error = new Error('El token no es válido');
        return response.status(404).json({error: error.message});
      }

      // Validar el usuario con el token solicitado
      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      response.send('La contraseña se modificó correctamente');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'});
    }
  }

  static user = async (request: Request, response: Response) => {
    return response.json(request.user);
  }

  static updateProfile = async (request: Request, response: Response) => {
    const { name, email } = request.body;
    const userExists = await User.findOne({email});

    // Verificar si el usuario existe y si es diferente al usuario autenticado
    if(userExists && userExists.id.toString() !== request.user.id.toString()) {
      const error = new Error('El correo ya está registrado');
      return response.status(409).json({error: error.message});
    }

    request.user.name = name;
    request.user.email = email;

    try {
      await request.user.save();
      response.send('Perfil actualizado correctamente');
    } catch (error) {
      response.status(500).json({error: 'Hubo un error'});
    }
  }

  static updateCurrentUserPassword = async (request: Request, response: Response) => {
    const { current_password, password } = request.body;
    const user = await User.findById(request.user.id);
    const isPasswordCorrect = await checkPassword(current_password, user.password);

    if(!isPasswordCorrect) {
      const error = new Error('La contraseña actual es incorrecta');
      return response.status(401).json({error: error.message});
    }
        
    try {
      user.password = await hashPassword(password);
      await user.save();
      response.send('La contraseña se modificó correctamente');
    } catch (error) {
      response.status(500).json({error: 'Hubo un error'});
    }
  }

  static checkPassword = async (request: Request, response: Response) => {
    const { password } = request.body;
    const user = await User.findById(request.user.id);

    const isPasswordCorrect = await checkPassword(password, user.password);
    if(!isPasswordCorrect) {
      const error = new Error('La contraseña es incorrecta');
      return response.status(401).json({ error: error.message });
    }

    response.send('Contraseña correcta');
  }
}