<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
// use App\Http\Controllers\Auth as Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        //sanitize and validate input, prevent injection attacks
        $validator=Validator::make($request->all(), [
            'name' => [ 'required', 'string', 'max:255' ],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:100', 'unique:'.User::class],
            'account_type' => ['required', 'in:buyer,seller'],
            'password' => ['required', 'min:8', 'max:50', 'confirmed', Password::defaults()],
        ]);

        //return errors if validation fails
        if($validator->fails()) {
            return response()->json(
                // data: $validator->errors(),
                // status: Response::HTTP_FORBIDDEN
                $validator->errors(),
                Response::HTTP_FORBIDDEN
            );
        }

        //eloquent ORM
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'account_type' => $request->account_type,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(
            // data: $user,
            // status: Response::HTTP_CREATED
            $user,
            Response::HTTP_CREATED
        );
    }

    public function login(Request $request)
    {
        $validator=Validator::make($request->all(), [
            'email' => ['required', 'string', 'lowercase', 'email', 'max:100'],
            'password' => ['required', 'min:8', 'max:50', Password::defaults()],
        ]);

        //return errors if validation fails
        if($validator->fails()) {
            return response()->json(
                $validator->errors(),
                Response::HTTP_FORBIDDEN //403
            );
        }

        // $user = User::where('email', $request->email)->first();
        // if(!$user || !Hash::check($request->password, $user->password)) {
        //     return response()->json(
        //         ['message' => 'Invalid credentials'],
        //         Response::HTTP_UNAUTHORIZED //401
        //     );
        // }

        //based sa turo ni sir arcris
        if ( ! Auth::attempt($request->all(), true)) {
            return response()->json(
                [
                    'status' => false,
                    'message' => 'Invalid credentials'
                ],
                Response::HTTP_UNAUTHORIZED //401
            );
        }

        $user = Auth::user();

        $token = $user->createToken($user)->plainTextToken;

        return response()->json(
            [
                'status' => true,
                'token' => $token,
                'data' => $user,
                'account_type' => $user->account_type
            ],
            Response::HTTP_OK //200
        );
    }
}
