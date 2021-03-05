<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    public const USERS = [
        1 => [
            'id' => 1,
            'username' => 'ivanD',
            'avatar_file_id' => 1,
        ],
        2 => [
            'id' => 2,
            'username' => 'bogdanO',
            'avatar_file_id' => 2,
        ],
        3 => [
            'id' => 3,
            'username' => 'slobodanT',
            'avatar_file_id' => 3,
        ]
    ];


    #[Route('/user/logged', name: 'Logged in user')]
    public function logged(): Response
    {
        return $this->json(self::USERS[0]['id']);
    }


    #[Route('/user/list', name: 'User List')]
    public function list(
        Request $request
    ): Response {
        $response = [];
        foreach ($request->toArray()['ids'] as $id) {
            $response[$id] = self::USERS[$id] ?? null;
        }
        return $this->json($response);
    }

    #[Route('/user/all', name: 'All User List')]
    public function all(): Response
    {
        return $this->json(self::USERS);
    }
}
