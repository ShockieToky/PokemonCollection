<?php

namespace App\Services;

interface SyncStrategyInterface
{
    public function sync(): array;
    public function getName(): string;
}
