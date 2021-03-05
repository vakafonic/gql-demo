<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class StreamController extends AbstractController
{
    public const STREAMS = [
        1 => [
            'id' => 1,
            'title' => 'Playing with cars',
            'thumbnail_file_id' => 31,
            'owner_id' => 1
        ],
        2 => [
            'id' => 2,
            'title' => 'We are ready to write some music - please join',
            'thumbnail_file_id' => 32,
            'owner_id' => 1
        ],
        3 => [
            'id' => 3,
            'title' => 'Playing HOMM3 naked!',
            'thumbnail_file_id' => 33,
            'owner_id' => 2
        ],
        4 => [
            'id' => 4,
            'title' => 'Just chat',
            'thumbnail_file_id' => 34,
            'owner_id' => 3
        ],
    ];

    public const VIEWS = [
        1 => 123,
        2 => 332,
        3 => 542,
        4 => 112,
    ];


    #[Route('/stream/list', name: 'Stream List, mapped by id')]
    public function list(
        Request $request
    ): Response {
        $response = [];
        foreach ($request->toArray()['ids'] as $id) {
            $response[$id] = self::STREAMS[$id] ?? null;
        }
        return $this->json($response);
    }


    #[Route('/stream/views', name: 'Stream views count for batch request')]
    public function views(
        Request $request
    ): Response {
        $response = [];
        foreach ($request->toArray()['ids'] as $id) {
            $response[$id] = self::VIEWS[$id] ?? null;
        }
        return $this->json($response);
    }

    #[Route('/stream/owned', name: 'Streams by owner')]
    public function owned(
        Request $request
    ): Response {
        $owner = $request->toArray()['owner'];
        $response = [];
        foreach (self::STREAMS as $stream) {
            if ($stream['owner_id'] === $owner) {
                $response[] = $stream;
            }
        }
        return $this->json($response);
    }

    #[Route('/stream/active', name: 'Active stream ids')]
    public function active(): Response
    {
        return $this->json([self::STREAMS[1]['id'], self::STREAMS[3]['id']]);
    }

    #[Route('/stream/top', name: 'Top stream ids')]
    public function top(): Response
    {
        return $this->json([self::STREAMS[2]['id'], self::STREAMS[3]['id'], self::STREAMS[4]['id']]);
    }
}
