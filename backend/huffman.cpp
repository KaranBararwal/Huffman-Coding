#include "huffman.h"

#include <iostream>
using namespace std;

void Huffman::buildFrequencyMap(const string &text) {
    freqMap.clear();
    
    for(char ch : text){
        freqMap[ch]++;
    }
}

void Huffman::buildHuffmanTree(){
    priority_queue<Node*, vector<Node*>, Compare> pq; // meanHeap

    for(auto &pair : freqMap){
        pq.push(new Node(pair.first, pair.second));
    }

    while(pq.size() > 1){
        Node * left = pq.top();
        pq.pop();
        Node * right = pq.top();
        pq.pop();

        Node * merged = new Node('\0', left->freq + right->freq);
        merged->left = left;
        merged->right = right;

        pq.push(merged);
    }

    root = pq.top();
}

void Huffman::generateCodes(Node * node , const string &code){
    if(!node) return;

    if(!node->left && !node->right) {
        huffmanCodes[node->ch] = code;
        return;
    }

    generateCodes(node->left , code + "0");
    generateCodes(node->right, code + "1");
}

void Huffman::serializeTree(Node * node , ostream &out){
    if(!node){
        return;
    }

    if(!node->left && !node->right){
        out << "1" << node->ch;
    }
    else{
        out << "0";
        serializeTree(node->left, out);
        serializeTree(node->right, out);
    }
}

Node * Huffman::deserializeTree(istream &in) {
    char bit;
    in.get(bit);

    if(bit == '1'){
        char ch;
        in.get(ch);
        return new Node(ch, 0); // frequency not needed for leaf
    }

    Node * node = new Node('\0', 0);
    node->left = deserializeTree(in);  // ✅ Fix here
    node->right = deserializeTree(in); // ✅ Fix here
    return node;
}

void Huffman::compress(const string &inputFile, const string &outputFile, const string &treeFile) {
    ifstream in(inputFile);
    ofstream out(outputFile, ios::binary);
    ofstream treeOut(treeFile);
    
    string text((istreambuf_iterator<char>(in)), istreambuf_iterator<char>());

    buildFrequencyMap(text);
    buildHuffmanTree();
    generateCodes(root, "");

    string encoded;
    for(char ch : text){
        encoded += huffmanCodes[ch];
    }

    int padding = (8 - (encoded.size() % 8)) % 8;
    for(int i = 0; i < padding; ++i) {
        encoded += '0';
    }

    // Save padding as the first byte
    out.put(static_cast<unsigned char>(padding));

    for(size_t i = 0; i < encoded.size(); i += 8) {
        bitset<8> byte(encoded.substr(i, 8));
        out.put(static_cast<unsigned char>(byte.to_ulong()));
    }

    serializeTree(root, treeOut);

    cout<< "Compression completed successfully.\n";
}


void Huffman::decompress(const string &inputFile , const string &outputFile , const string &treeFile){
    ifstream in(inputFile , ios::binary);
    ifstream treeIn(treeFile);
    ofstream out(outputFile);

    root = deserializeTree(treeIn);
    string bitString;

    char byte;

    // Read padding byte
    in.get(byte);
    int padding = static_cast<unsigned char>(byte);

    // Read the rest of the file
    while(in.get(byte)) {
        bitset<8> bits(byte);
        bitString += bits.to_string();
    }

    // Remove padding bits from the end
    if (padding > 0 && padding <= 8) {
        bitString = bitString.substr(0, bitString.size() - padding);
    }

    Node * node = root;
    for(char bit : bitString){
        node = (bit == '0') ? node->left : node->right;

        if(!node->left && !node->right) {
            out.put(node->ch);
            node = root;
        }
    }
    
    cout << "Decompression completed successfully.\n";
}

