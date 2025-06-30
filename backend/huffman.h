#pragma once
#include <iostream>
#include <fstream>
#include <unordered_map>
#include <queue>
#include <vector>
#include <bitset>
using namespace std;

struct Node{
    char ch;
    int freq;
    Node * left;
    Node * right;

    Node(char character, int frequency) : ch(character), freq(frequency), left(nullptr), right(nullptr) {}
};

struct Compare{
    bool operator()(Node* a, Node* b){
        return a->freq > b->freq;
    }
};

class Huffman{
    public:
        void compress(const string &inputFile, const string &outputFile, const string &treeFile);
        void decompress(const string &inputFile, const string &outputFile, const string &treeFile);
    private:
        void buildFrequencyMap(const string &text);
        void buildHuffmanTree();
        void generateCodes(Node * root , const string &str);
        void serializeTree(Node * root, ostream &out);
        Node * deserializeTree(istream &in);

        unordered_map<char, int> freqMap;
        unordered_map<char, string> huffmanCodes;

        Node * root = nullptr;
};