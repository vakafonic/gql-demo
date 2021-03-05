<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class FileController extends AbstractController
{
    public const FILES = [
        1 => [
            'id' => 1,
            'name' => 'First file',
            'url' => 'url 1',
        ],
        2 => [
            'id' => 2,
            'name' => 'Second file',
            'url' => 'url 2',
        ],
        3 => [
            'id' => 3,
            'name' => 'Third file',
            'url' => 'url 3',
        ],
        31 => [
            'id' => 31,
            'name' => 'First stream file',
            'url' => 'url stream 1',
        ],
        32 => [
            'id' => 32,
            'name' => 'Second stream file',
            'url' => 'url stream 2',
        ],
        33 => [
            'id' => 33,
            'name' => 'Third stream file',
            'url' => 'url stream 3',
        ],

    ];

    #[Route('/file/{id}/info', name: 'File info for one file')]
    public function info(
        string $id
    ): Response {
        return $this->json(
            [
                'id' => (int)$id,
                'name' => 'RealFileName',
                'url' => 'real url for file with id: ' . $id,
            ]
        );
    }

    #[Route('/file/list', name: 'List of files, that mapped by file id')]
    public function list(
        Request $request
    ): Response {
        $response = [];
        foreach ($request->toArray()['ids'] as $id) {
            $response[$id] = self::FILES[$id] ?? null;
        }
        return $this->json($response);
    }
}
